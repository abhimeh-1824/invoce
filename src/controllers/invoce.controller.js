const InvoiceCollection = require("../models/invoce.model.js");
const router = require("express").Router();

// check create invoice date is between previeus date and next date or not
async function checkDate(invoiceNumber, day, month, year) {
  let isDateBitween = false;
  // find just previous value
  const privesInvoice = await InvoiceCollection.findOne({
    invoiceNumber: { $lte: invoiceNumber },
  })
    .sort({ invoiceNumber: -1 })
    .lean()
    .exec();
  const privesDay = privesInvoice ? privesInvoice.invoiceDate.day : null;
  const privesMonth = privesInvoice ? privesInvoice.invoiceDate.month : null;
  const privesYear = privesInvoice ? privesInvoice.invoiceDate.year : null;
  // find just next Invoice
  const nextInvoice = await InvoiceCollection.findOne({
    invoiceNumber: { $gt: invoiceNumber },
  })
    .sort({ invoiceNumber: 1 })
    .lean()
    .exec();
  const nextDay = nextInvoice ? nextInvoice.invoiceDate.day : null;
  const nextMonth = nextInvoice ? nextInvoice.invoiceDate.month : null;
  const nextYear = nextInvoice ? nextInvoice.invoiceDate.year : null;

  // check prives date and next date
  if (
    (privesDay == null && nextDay == null) ||
    (privesDay == null &&
      (nextYear > year ||
        (nextYear >= year && nextMonth > month) ||
        (nextYear >= year && nextMonth >= month && nextDay > day))) ||
    (nextDay == null &&
      (privesYear < year ||
        (privesYear <= year && privesMonth < month) ||
        (privesYear <= year && privesMonth <= month && privesDay <= day))) ||
    ((privesYear < year ||
      (privesYear <= year && privesMonth < month) ||
      (privesYear <= year && privesMonth <= month && privesDay <= day)) &&
      (nextYear > year ||
        (nextYear >= year && nextMonth > month) ||
        (nextYear >= year && nextMonth >= month && nextDay > day)))
  ) {
    // enter date is align between previous and next date
    isDateBitween = true;
  }
  return {
    isDateBitween,
    privesDay,
    privesMonth,
    privesYear,
    nextDay,
    nextMonth,
    nextYear,
  };
}

// get all invoice
router.get("/getInvoice", async (req, res) => {
  try {
    const getInvoice = await InvoiceCollection.find()
      .sort({ invoiceNumber: 1 })
      .lean()
      .exec();
    res.status(200).send({
      status: "success",
      message: "success full get Invoice",
      data: getInvoice,
    });
  } catch (error) {
    res.status(400).send({ status: "failed", error: error.message });
  }
});

// get invoice btween two date
// http://localhost:8085/invoice/api/getInvoiceBetweenDate/?firstDay=4&firstMonth=1&firstYear=2009&secondDay=6&secondMonth=1&secondYear=2016
router.get("/getInvoiceBetweenDate", async (req, res) => {
  const {
    firstDay,
    firstMonth,
    firstYear,
    secondDay,
    secondMonth,
    secondYear,
  } = req.query;
  if (
    firstDay &&
    firstMonth &&
    firstYear &&
    secondDay &&
    secondMonth &&
    secondYear
  ) {
    try {
      const getInvoice = await InvoiceCollection.find({$and:[{$and:[{"invoiceDate.day":{$gte:firstDay}},{"invoiceDate.day":{$lte:secondDay}}]},
      {$and:[{"invoiceDate.month":{$gte:firstMonth}},{"invoiceDate.month":{$lte:secondMonth}}]},
      {$and:[{"invoiceDate.year":{$gte:firstYear}},{"invoiceDate.year":{$lte:secondYear}}]}
    ]})
        .sort({ invoiceNumber: 1 })
        .lean()
        .exec();
      res.status(200).send({
        status: "success",
        message: "success full get Invoice",
        data: getInvoice,
      });
    } catch (error) {
      res.status(400).send({ status: "failed", error: error.message });
    }
  } else {
    res.status(400).send({
      satus: "failed",
      message: `all query requied firstDay,
    firstMonth,
    firstYear,
    secondDay,
    secondMonth,
    secondYear`,
    });
  }
});

// create new invoice
router.post("/createNewInvoice", async (req, res) => {
  const { invoiceNumber, invoiceDate, invoiceAmount } = req.body;
  const invoiceNumberPresent = await InvoiceCollection.findOne({
    invoiceNumber: invoiceNumber,
  });
  if (!invoiceNumberPresent) {
    const { day, month, year } = invoiceDate;
    if (invoiceNumber && invoiceDate && invoiceAmount && day && month && year) {
      try {
        const {
          isDateBitween,
          privesDay,
          privesMonth,
          privesYear,
          nextDay,
          nextMonth,
          nextYear,
        } = await checkDate(invoiceNumber, day, month, year);
        if (isDateBitween) {
          const invoiceData = await InvoiceCollection.create(req.body);
          res.status(200).send({
            status: "success",
            message: "invoice created success full",
            invoice: invoiceData,
          });
        } else {
          res.send({
            status: "failed",
            message: `enter date beetwin ${
              privesDay == null ? "" : privesDay
            }/${privesMonth == null ? "" : privesMonth}/${
              privesYear == null ? "" : privesYear
            } and ${nextDay == null ? "" : nextDay}/${
              nextMonth == null ? "" : nextMonth
            }/${nextYear == null ? "" : nextYear}`,
          });
        }
      } catch (error) {
        res.send({ status: "failed", error: error.message });
      }
    } else {
      res
        .status(400)
        .send({ status: "failed", message: "all failed required!!!" });
    }
  } else {
    res
      .status(400)
      .send({ status: "failed", message: "Invoice already present !!!" });
  }
});

// update invoice
router.patch("/updateInvoice/:invoiceNumber", async (req, res) => {
  const invoiceNumber = req.params.invoiceNumber;
  const day = req.body.invoiceDate.day;
  const month = req.body.invoiceDate.month;
  const year = req.body.invoiceDate.year;
  console.log(day, month, year);
  const {
    isDateBitween,
    privesDay,
    privesMonth,
    privesYear,
    nextDay,
    nextMonth,
    nextYear,
  } = await checkDate(invoiceNumber, day, month, year);
  if (isDateBitween) {
    try {
      console.log(req.params.invoiceNumber);
      const updateInvoice = await InvoiceCollection.findOneAndUpdate(
        { invoiceNumber: req.params.invoiceNumber },
        req.body,
        { new: true }
      );
      res.status(200).send({ status: "success", data: updateInvoice });
    } catch (error) {
      res.status(400).send({ status: "failed", error: error.message });
    }
  } else {
    res.send({
      status: "failed",
      message: `enter date beetwin ${privesDay == null ? "" : privesDay}/${
        privesMonth == null ? "" : privesMonth
      }/${privesYear == null ? "" : privesYear} and ${
        nextDay == null ? "" : nextDay
      }/${nextMonth == null ? "" : nextMonth}/${
        nextYear == null ? "" : nextYear
      }`,
    });
  }
});

// delete invoice
router.delete("/deleteInvoice/:invoiceNumber", async (req, res) => {
  try {
    const deleteInvoice = await InvoiceCollection.findOneAndDelete({
      invoiceNumber: req.params.invoiceNumber,
    });
    res.status(200).send({
      status: "success",
      message: "Invoice success full deleted",
      data: deleteInvoice,
    });
  } catch (error) {
    res.status(400).send({ status: "failed", error: error.message });
  }
});

module.exports = router;
