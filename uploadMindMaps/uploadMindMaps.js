const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const LMSChapter = require('../models/LMSChapter');
const Material = require('../models/Material');
const { connectToDatabase } = require('../utils/db');

// Constants for material types, file types, and levels
const {
  MATERIAL_TYPES,
  MATERIAL_FILE_TYPES,
  MATERIAL_LEVELS,
} = require('../constants/index');

const FILE_DIRECTORY = path.join(__dirname, 'pdfs');

// Helper function to get the file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toUpperCase();
}

// Helper function to recursively read files from directories
function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively go into subfolders
      getAllFiles(filePath, fileList);
    } else if (getFileExtension(file) === 'PDF') {
      // Only add PDF files to the list
      fileList.push(filePath);
    }
  });

  return fileList;
}

// Function to log errors to a file
function logErrorToFile(errorMessage) {
  const logFilePath = path.join(__dirname, 'error_log.txt'); // Change path as needed
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${errorMessage}\n`;

  fs.appendFileSync(logFilePath, logMessage, { encoding: 'utf8' });
}

// Function to upload materials to chapters based on the files in the folder
async function uploadMaterialToChapters() {
  try {
    await connectToDatabase();
    const pdfFiles = getAllFiles(FILE_DIRECTORY);

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the directory.');
      return;
    }

    console.log(`Found ${pdfFiles.length} PDF files.`);

    for (const filePath of pdfFiles) {
      let fileName = path.basename(filePath, path.extname(filePath));
      fileName = fileName.replace(/^\d+\.\s*/, '');

      console.log(`Processing file: ${fileName}`);

      const chapters = await LMSChapter.find({ name: new RegExp(fileName, 'i'), deleted:false });

      if (chapters.length === 0) {
        console.log(`No chapters found for file: ${fileName}`);
        continue;
      }

      console.log(`Found ${chapters.length} chapters for file: ${fileName}`);

      for (const chapter of chapters) {
        const materialData = {
          name: fileName,
          path: `pdf/${fileName}`,
          fileType: MATERIAL_FILE_TYPES.PDF,
          materialType: MATERIAL_TYPES.MIND_MAP,
          materialLevel: MATERIAL_LEVELS.CHAPTER,
          sequence: 1,
          courseId: chapter.courseId,
          courseName: chapter.courseName,
          subjectId: chapter.subjectId,
          subjectName: chapter.subjectName,
          chapterId: chapter._id,
          chapterName: chapter.name,
        };

        console.log(`Preparing to upload material for chapter: ${chapter.name}`);

        try {
          const material = await Material.create(materialData);
          chapter.hasMaterial = true;
          await chapter.save();

          console.log(`Uploaded material for chapter: ${chapter.name} (Material ID: ${material._id})`);
        } catch (uploadError) {
          const errorMsg = `Error uploading material for chapter ${chapter.name}: ${uploadError.message}`;
          console.error(errorMsg);
          logErrorToFile(errorMsg);
        }
      }
    }

    console.log('All materials uploaded successfully.');
  } catch (error) {
    const errorMsg = `Error uploading materials: ${error.message}`;
    console.error(errorMsg);
    logErrorToFile(errorMsg);
  } finally {
    mongoose.connection.close();
  }
}

uploadMaterialToChapters();
