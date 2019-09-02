import RequestServices from '../services/requestService';
import Response from '../utils/response';

const { badRequest, success } = Response;
/**
 * Class for managing trip request
 */
export default class RequestController {
  /**
   * @param {req} req - request obiect
   * @param {res} res - res object object
   * @returns {object} - return object
   */
  static async multiCityRequest(req, res) {
    try {
      const data = await RequestServices.multiCityRequest(req);

      success(res, data);
    } catch ({ message: error }) {
      badRequest(res, error);
    }
  }
}
