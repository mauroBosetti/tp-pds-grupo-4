import {Router} from "express";

const authRouter: Router = Router();

authRouter.post('/register', (req, res) => {
  // TODO
  res.json({})
})
authRouter.post('/login', (req, res) => {
  // TODO
  res.json({})
})

export {authRouter}