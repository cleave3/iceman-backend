import { Request } from '../models';
import Response from '../utils/response';
import Helper from '../utils/helpers';

const { error } = Response;

/**
 * Request service class
 */
export default class RequestService {
  /**
  * update trip rquest
  * @param {number} id - request id
  * @param {object} data - request object
  * @return {object} - updated request
  */
  static async updateRequest({ body, params, user: { id } }) {
    const userRequest = await Request.findOne({ where: { id: params.requestId } });

    if (!userRequest) error('Trip request not found');

    const { userId, status } = userRequest;

    if (userId !== id) error('You are not allowed to edit this request');

    if (body.tripType === 'one-way') body.returnDate = null;

    if (status !== 'open') error(`Request has been ${status}. cannot edit`);

    body.destination = body.destination.split(',');

    const updatedRequest = await Request.update(body, {
      where: { id: params.requestId },
      returning: true
    });

    return updatedRequest[1][0].dataValues;
  }

  /**
  * update trip request
  * @param {number} id - request id
  * @param {object} data - request object
  * @return {object} - updated request
  */
  static async respondToRequest({ body: { status }, params: { requestId }, user: { id } }) {
    const userRequest = await Request.findOne({ where: { id: requestId } });

    if (!userRequest) error('Trip request not found');

    if (status !== 'approved' && status !== 'rejected') error('Response status must be approved or rejected');

    if (userRequest.userId === id) error('You cannot respond to your own request');

    const isDownlinesRequest = await Request.findOne({
      where: { id: requestId },
      include: Helper.mapToDepartment(id)
    });

    if (!isDownlinesRequest) error('This request is not from your direct report');

    const [, [{ dataValues }]] = await Request.update({ status }, {
      where: { id: requestId }, returning: true
    });

    return dataValues;
  }

  /**
   * @param {object} details trip details
   * @param {number} userId ID of the user creating the request
   * @returns{void}
   */
  static async oneway({ body, user: { id } }) {
    const { travelDate } = body;
    const existingRequest = await Request.count({ where: { travelDate, userId: id } });

    if (existingRequest) error('You\'ve already booked this trip');

    body.destination = body.destination.split(',');

    return Request.create({ ...body, userId: id });
  }

  /**
   * @param {object} body - arrays of request object
   * @returns {object} obej - return object
   */
  static async multiCityRequest({ body, user: { id } }) {
    const { travelDate } = body;
    const destination = body.destination.split(',');

    if (destination.length <= 1) error('Request must be more than one');

    const existingRequest = await Request.count({ where: { travelDate, userId: id } });

    if (existingRequest) error('You\'ve already booked this trip');

    if (body.tripType !== 'multi-city') error('Trip type must be multi city');

    const { dataValues } = await Request.create({ ...body, destination, userId: id });

    return dataValues;
  }

  /**
   * @param {object} body - arrays of request object
   * @returns {object} obej - return object
   */
  static async getRequests({ user: { id } }) {
    const result = await Request.findAll({ where: { userId: id } });

    if (result.length === 0) error('You\'ve not made any requests');

    return result;
  }

  /**
   *
   * @param {number} id - manager's id
   * @return {object} - open requests
   */
  static async availOpenRequests({ user: { id } }) {
    const openRequests = await Request.findAll({
      where: { status: 'open' },
      include: Helper.mapToDepartment(id)
    });

    if (openRequests.length < 1) error('There are no pending requests');

    return openRequests;
  }

  /**
   * @param {object} details - user trip details
   * @returns {object} trip - details
   */
  static async returnRequest({ body, user: { id } }) {
    const { travelDate } = body;

    const existingRequest = await Request.count({ where: { travelDate, userId: id } });

    if (body.tripType !== 'return') error('Trip type must be return trip');

    if (!body.returnDate) error('Return date is required');

    if (existingRequest) error('You\'ve already booked this trip');

    body.destination = body.destination.split(',');

    if (body.destination.length > 1) error('Return trip allow only one destination');

    const { dataValues } = await Request.create({ ...body, userId: id });

    return dataValues;
  }
}
