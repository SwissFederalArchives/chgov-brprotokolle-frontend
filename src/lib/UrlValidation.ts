class UrlValidation {
  static isURL(str: string) {
    try {
      const url = new URL(str);
      return url.protocol === "http:" || url.protocol === "https:" || url.protocol === "ftp:" || url.protocol === "ftps:";
    } catch (err) {
      return false;
    }
  }
}

export default UrlValidation;
