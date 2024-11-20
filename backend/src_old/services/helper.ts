export class Helper {
  /**
   * Checks if a string is in a uuid format using regex
   *
   * @public
   * @static
   * @param {string} uuid - string for testing
   * @returns {boolean} - result 
   */
  public static isValidUUID(uuid: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Gets and returns the current date in the unix timestamp format
   *
   * @public
   * @static
   * @returns {number} - current date as an unix timestamp
   */
  public static getUNIXTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

  /**
   * Converts a visibility value ("public" || "private") to 
   * a table name ("ArticlesPublished" || "ArticlesUnpublished")
   *
   * @public
   * @static
   * @param {String} visibility - visibility value
   * @returns {(false | "ArticlesPublished" | "ArticlesUnpublished")} - table name
   */
  public static visibilityToTable(visibility: String) {
    if (visibility == 'public') {
      return 'ArticlesPublished';
    } else if (visibility == 'private') {
      return 'ArticlesUnpublished';
    } else {
      return false;
    }
  }
}
