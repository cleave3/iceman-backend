import { Op } from 'sequelize';
import { Request } from '../models';
import Response from '../utils/response';

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

    const updatedRequest = await Request.update(body, { where: { id }, returning: true });

    return updatedRequest[1][0].dataValues;
  }

  /**
   * @param {object} details trip details
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

    if (body.tripType !== 'multi-city') error('Trip type must be mulit city');

    const { dataValues } = await Request.create({ ...body, destination, userId: id });

    return dataValues;
  }

  /**
   * @param {object} body - arrays of request object
   * @returns {object} obej - return object
   */
  static async getRequests({ user: { id } }) {
    const result = await Request.findAll({ where: { userId: id } });

    if (result.length === 0) error('You\'ve not make any requests');

    return result;
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

    const { dataValues } = await Request.create({ ...body, userId: id });

    return dataValues;
  }

  /**
   *
   * @param {object} query - search object
   * @returns {object} data
   */
  static async search(query) {
    const { destination } = query;

    if (destination) {
      const data = await Request.findAll({
        where: {
          destination: {
            [Op.contains]: [`${Object.values(query)[0]}`]
          },
        },
      });

      if (data.length === 0) error('Destination not found');

      return data;
    }

    const data = await Request.findAll({
      where: {
        [Object.keys(query)[0]]: {
          [Op.iLike]: `%${Object.values(query)[0]}%`,
        },
      },
    });

    if (data.length === 0) error(`${Object.keys(query)[0]} not found`);

    return data;
  }
}
