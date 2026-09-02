import {Router} from "express";

const userRouter: Router = Router();

userRouter.get('/', (req, res) => {
  // TODO
  res.json({})
})

export {userRouter}