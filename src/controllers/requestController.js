import RequestService from '../services/requestService';
import Response from '../utils/response';

const { success, badRequest, error } = Response;
const { updateRequest, getRequest } = RequestService;

/**
 * Class for Requests
 */
export default class RequestController {
/**
 * Update a pending trip request
 * @param {object} req - requset object
 * @param {object} res - response object
 * @return {json} - json
 */
  static async update(req, res) {
    const data = req.body;
    const { requestId } = req.params;
    const { id } = req.decoded;

    try {
      const userRequest = await getRequest(requestId);

      if (!userRequest) error('Trip request not found');

      const { userId } = userRequest;

      if (userId !== id) error('You are not allowed to edit this request');

      if (data.tripType !== 'return') data.returnDate = null;

      const result = await updateRequest(Number(requestId), data);

      success(res, result);
    } catch ({ message: err }) {
      badRequest(res, err);
    }
  }
}
