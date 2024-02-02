const mongoose =require('mongoose');
const db ='mongodb+srv://divyansh:Sharma_123@cluster0.u4bmqvm.mongodb.net/?retryWrites=true&w=majority'
mongoose.connect(db,{
    useNewUrlParser:true,
    useUnifiedTopology:true

}).then(()=>{
     console.log('database connected successfully');
}).catch((e)=>{
     console.log(e,'<=error');
})