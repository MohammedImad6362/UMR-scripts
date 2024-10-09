const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const LMSChapter = require('../models/LMSChapter');  
const Material = require('../models/Material');  
const { connectToDatabase } = require('../utils/db')

// Constants for material types, file types, and levels (Adjust according to your actual constants)
const {
  MATERIAL_TYPES,
  MATERIAL_FILE_TYPES,
  MATERIAL_LEVELS,
} = require('../constants/index');  // Path to your constants file

// Helper function to get the file extension
function getFileExtension(filename) {
  return filename.split('.').pop().toUpperCase();
}

// Helper function to recursively read files from directories (including subfolders)
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

// Function to upload materials to chapters based on the files in the folder
async function uploadMaterialToChapters() {
  try {
    await connectToDatabase()
    // Step 1: Get all PDF files (including those in subdirectories)
    const pdfFiles = getAllFiles(FILE_DIRECTORY);

    if (pdfFiles.length === 0) {
      console.log('No PDF files found in the directory.');
      return;
    }

    console.log(`Found ${pdfFiles.length} PDF files`);

    // Step 2: Loop through each PDF file
    for (const filePath of pdfFiles) {
      const fileName = path.basename(filePath, path.extname(filePath)); // Get the file name without the extension

      // Step 3: Fetch chapters with name matching the file (using file name as regex, case-insensitive)
      const chapters = await LMSChapter.find({ name: new RegExp(fileName, 'i') });

      if (chapters.length === 0) {
        console.log(`No chapters found for file: ${fileName}`);
        continue;
      }

      // Step 4: Upload material for each chapter
      for (const chapter of chapters) {
        const materialData = {
          name: fileName,  // Use the file name as the material name
          path: filePath,  // Full file path
          fileType: MATERIAL_FILE_TYPES.PDF,  // Since it's a PDF
          materialType: MATERIAL_TYPES.MIND_MAP,  // Example material type, adjust as needed
          materialLevel: MATERIAL_LEVELS.CHAPTER,  // Assuming chapter level material
          sequence: '1',  // Example sequence, adjust accordingly
          courseId: chapter.courseId,
          courseName: chapter.courseName,
          subjectId: chapter.subjectId,
          subjectName: chapter.subjectName,
          chapterId: chapter._id,
          chapterName: chapter.name,
        };

        console.log("material", materialData)
        // Save the material to the database
        const material = await  Material.create(materialData);

        // Update the chapter to reflect that it has material
        chapter.hasMaterial = true;
        await chapter.save();

        console.log(`Uploaded material for chapter: ${chapter.name}`);
      }
    }

    console.log('All materials uploaded successfully.');
  } catch (error) {
    console.error('Error uploading materials:', error);
  } finally {
    // Close the MongoDB connection
    mongoose.connection.close();
  }
}

uploadMaterialToChapters()