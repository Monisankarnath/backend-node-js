import fs from "fs";

const unlinkFiles = (filePaths = []) => {
  try {
    if (filePaths?.length) {
      filePaths.forEach((path) => {
        if (path?.trim()?.length) {
          fs.unlinkSync(path);
        }
      });
    }
  } catch (error) {
    console.log("Error in unlinking files: ", error);
  }
};

export { unlinkFiles };
