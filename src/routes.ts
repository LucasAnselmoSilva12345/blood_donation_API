import express from 'express';
import ConnectionsController from './controllers/ConnectionsController';
import DonorsController from './controllers/DonorsController';

const routes = express.Router();
const donorsController = new DonorsController();
const connectionsController = new ConnectionsController();

routes.post('/donation', donorsController.create);
routes.get('/donation', donorsController.index);

routes.post('/connections', connectionsController.create);
routes.get('/connections', connectionsController.index);

export default routes;
