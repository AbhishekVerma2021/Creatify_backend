const jwt = require('jsonwebtoken');
const Users=require('../models/userModel')
const authenticate =async(req,res,next)=>{
    try{
     
      const {authorization=''} =req.headers;
      
      
      const token = req.headers.authorization.split('Bearer ')[1];
     
      if(!authorization && !token )
      {
        res.status(401).send('Invalid Token')
      }
      const verifyToken =jwt.verify(token,'THIS_IS_THE_SECRET_KEY_OF_JWT');
     
      const user =await Users.findOne({_id:verifyToken.id})
     
      if(!user)
      {
        res.status(401).send('User not Found')
      }
      req.user=user;
      next()
    }
    catch(error){
        res.status(401).send(error)

    }

}
module.exports= authenticate
