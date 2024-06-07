export class Helper {
  public static isValidUUID(uuid: string) {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  public static getUNIXTimestamp() {
    return Math.floor(new Date().getTime() / 1000);
  }

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
