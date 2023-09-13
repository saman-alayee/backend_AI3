const { RFP, validate } = require("../models/RFP");
const express = require("express");
const nodemailer = require("nodemailer"); // Don't forget to require nodemailer
const router = express.Router();
const ExcelJS = require("exceljs");
const path = require("path");
const auth = require("../middleware/auth")
// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Use the SMTP host of the email service (e.g., Gmail)
  port: 465,
  secure: true,
  auth: {
    user: "saman.alaii10@gmail.com", // Replace with your Gmail email
    pass: "66678141", // Replace with your Gmail password
  },
});

router.get("/",  async (req, res) => {
  const rfps = await RFP.find().sort("name");
  res.send(rfps);
});

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Create a new Request instance
  let rfp = new RFP({
    field_1: req.body.field_1,
    field_2: req.body.field_2,
    field_3: req.body.field_3,
    field_4: req.body.field_4,
    field_5: req.body.field_5,
    field_6: req.body.field_6,
    field_7: req.body.field_7,
    field_8: req.body.field_8,
    field_9: req.body.field_9,
    field_10: req.body.field_10,
    field_11: req.body.field_11,
    field_12: req.body.field_12,
    field_13: req.body.field_13,
    field_14: req.body.field_14,
    field_15: req.body.field_15,
    field_16: req.body.field_16,
    field_17: req.body.field_17,
    field_18: req.body.field_18,
    field_19: req.body.field_19,
    field_20: req.body.field_20,
    field_21: req.body.field_21,
    field_22: req.body.field_22,
    field_23: req.body.field_23,
    field_24: req.body.field_24,
    field_25: req.body.field_25,
    field_26: req.body.field_26,
    field_27: req.body.field_27,
    field_28: req.body.field_28,
    field_29: req.body.field_29,
    field_30: req.body.field_30,
    field_31: req.body.field_31,
    field_32: req.body.field_32,
    field_33: req.body.field_33,
    field_34: req.body.field_34,
    field_35: req.body.field_35,
    field_36: req.body.field_36,
    field_37: req.body.field_37,
    field_38: req.body.field_38,
    field_39: req.body.field_39,
    field_40: req.body.field_40,
    field_41: req.body.field_41,
    field_42: req.body.field_42,
    field_43: req.body.field_43,
    field_44: req.body.field_44
});


  // Save the new question to the database
  rfp = await rfp.save();

  // Send the newly created question as the response
  res.send(rfp);
});
// ... (previous imports and code)

router.delete("/:id", auth, async (req, res) => {
  try {
    // Find the question by ID and delete it
    const rfp = await RFP.findByIdAndRemove(req.params.id);

    if (!rfp) {
      return res.status(404).send("question with the given ID was not found.");
    }

    res.send(rfp);
  } catch (error) {
    return res
      .status(500)
      .send("An error occurred while deleting the question.");
  }
});

// ... (previous imports and code)

// router.get("/:id", async (req, res) => {
//   try {
//     // Find the request by ID
//     const request = await Request.findById(req.params.id);

//     if (!request) {
//       return res.status(404).send("Request with the given ID was not found.");
//     }

//     res.send(request);
//   } catch (error) {
//     return res.status(500).send("An error occurred while fetching the request.");
//   }
// });

// ... (remaining code and module.exports)
// ... (previous imports and code)

// Delete all requests
router.delete("/", auth, async (req, res) => {
  try {
    // Delete all requests
    const result = await RFP.deleteMany();

    if (result.deletedCount === 0) {
      return res.status(404).send("No rfp found to delete.");
    }

    res.send(`Deleted ${result.deletedCount} rfps.`);
  } catch (error) {
    return res.status(500).send("An error occurred while deleting rfps.");
  }
});

router.get("/exportToExcel", auth, async (req, res) => {
  try {
    // Fetch all questions from the database
    const rfps = await RFP.find();

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Questions");

    // Define headers for the Excel file
    const headers = [
      "Index",
      "Field 1",
      "Field 2",
      "Field 3",
      "Field 4",
      "Field 5",
      "Field 6",
      "Field 7",
      "Field 8",
      "Field 9",
      "Field 10",
      "Field 11",
      "Field 12",
      "Field 13",
      "Field 14",
      "Field 15",
      "Field 16",
      "Field 17",
      "Field 18",
      "Field 19",
      "Field 20",
      "Field 21",
      "Field 22",
      "Field 23",
      "Field 24",
      "Field 25",
      "Field 26",
      "Field 27",
      "Field 28",
      "Field 29",
      "Field 30",
      "Field 31",
      "Field 32",
      "Field 33",
      "Field 34",
      "Field 35",
      "Field 36",
      "Field 37",
      "Field 38",
      "Field 39",
      "Field 40",
      "Field 41",
      "Field 42",
      "Field 43",
      "Field 44",
      "Created At",
    ];
    
    worksheet.addRow(headers);

    // Add data rows to the worksheet
    rfps.forEach((rfp, index) => {
      worksheet.addRow([
        index + 1,
        rfp.field_1,
        rfp.field_2,
        rfp.field_3,
        rfp.field_4,
        rfp.field_5,
        rfp.field_6,
        rfp.field_7,
        rfp.field_8,
        rfp.field_9,
        rfp.field_10,
        rfp.field_11,
        rfp.field_12,
        rfp.field_13,
        rfp.field_14,
        rfp.field_15,
        rfp.field_16,
        rfp.field_17,
        rfp.field_18,
        rfp.field_19,
        rfp.field_20,
        rfp.field_21,
        rfp.field_22,
        rfp.field_23,
        rfp.field_24,
        rfp.field_25,
        rfp.field_26,
        rfp.field_27,
        rfp.field_28,
        rfp.field_29,
        rfp.field_30,
        rfp.field_31,
        rfp.field_32,
        rfp.field_33,
        rfp.field_34,
        rfp.field_35,
        rfp.field_36,
        rfp.field_37,
        rfp.field_38,
        rfp.field_39,
        rfp.field_40,
        rfp.field_41,
        rfp.field_42,
        rfp.field_43,
        rfp.field_44,
        rfp.createdAt.toISOString(), // Convert createdAt date to ISO format
      ]);
    });
    
    // Generate a file path for the Excel file
    const exportPath = path.join(__dirname, "../exports/Rfp.xlsx"); // Change this path as needed

    // Save the Excel file
    await workbook.xlsx.writeFile(exportPath);

    res.sendFile(exportPath);
  } catch (error) {
    console.error("Error exporting to Excel:", error);
    res.status(500).send("An error occurred while exporting to Excel.");
  }
});

router.get("/downloadExcel", auth, (req, res) => {
  const filePath = path.join(__dirname, "../exports/Rfp.xlsx"); // Change this path as needed

  res.download(filePath, "Rfp.xlsx", (err) => {
    if (err) {
      console.error("Error downloading Excel file:", err);
      res
        .status(500)
        .send("An error occurred while downloading the Excel file.");
    }
  });
});

// ... (previous imports and code)

module.exports = router;
