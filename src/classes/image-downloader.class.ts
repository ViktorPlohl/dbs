import fs from "fs";
import http from "http";

export class ImageDownloader {
  fileName: string;
  url: string;

  constructor(url: string, fileName: string) {
    this.fileName = fileName;
    this.url = url;
  }

  async download(): Promise<void> {
    const fileName = this.fileName;
    const path ="./images/" + fileName + ".png";
    await http.get(this.url, function(response) {
      const file = fs.createWriteStream(path);
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        console.log("Download Completed: " +  fileName);
      });
    });
  }
}
