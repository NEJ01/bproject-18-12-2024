  const app = require('express').Router()
  const multer = require('multer');

  const Foodmodel=require("../model/Food")

  const storage = multer.memoryStorage(); 
  const upload = multer({ storage: storage });

  //for saving
  // app.post('/Fnew', upload.single('photo'), async (request, response) => {
  //         try {
  //                 const { Fname,Description,Price,Cid,Status } = request.body
  //                 console.log(request.body)
  //                 console.log(request.file);

  //                 const newdata = new Foodmodel({
  //                     Fname,Description,Price,Cid,Status,
  //                     photo: {
  //                         data: request.file.buffer,
  //                         contentType: request.file.mimetype,
  //                     }
  //                 })


  //                 await newdata.save();
  //                 response.status(200).json({ message: 'food added successfully' });
  //         }
  //     catch (error) 
  //     {
  //                 response.status(500).json({ error: 'Internal Server Error' });
  //     }
  // }
  // )
  app.post('/Fnew', upload.single('photo'), async (request, response) => {
    try {
      const { Fname, Description, Price, Cid, Status } = request.body;
  
      // Debugging logs
      console.log('Request Body:', request.body);
      console.log('File:', request.file);
  
      // Ensure all required fields are present
      if (!Fname || !Description || !Price || !Cid || !Status || !request.file) {
        return response.status(400).json({ error: 'All fields are required' });
      }
  
      const newdata = new Foodmodel({
        Fname,
        Description,
        Price: Number(Price), // Ensure Price is a number
        Cid,
        Status,
        photo: {
          data: request.file.buffer,
          contentType: request.file.mimetype,
        },
      });
  
      await newdata.save();
      response.status(200).json({ message: 'Food added successfully' });
    } catch (error) {
      console.error('Error:', error); // Log the full error
      response.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  });
  
  //For retriving  data

  app.get('/Foodview', async (request, response) => {
    try {
      const result = await Foodmodel.aggregate([
        {
          $lookup: {
            from: 'foods', // Name of the other collection
            localField: 'Cid', // field of item
            foreignField: '_id', // field of category
            as: 'ffood',
          },
        },
      ]);
  
      // Convert Binary data to buffer before sending
      result.forEach((food) => {
        if (food.photo && food.photo.data) {
          food.photo.data = food.photo.data.buffer;
        }
      });
  
      response.send(result);
    } catch (error) {
      console.error('Error fetching food data:', error);
      response.status(500).json({ error: 'Internal Server Error' });
    }
  });
  

    
  //For update status delete
  app.put('/updatestatus/:id',async(request,response)=>{
    let id = request.params.id
    await Foodmodel.findByIdAndUpdate(id,{$set:{Status:"INACTIVE"}})
    response.send("Record Deleted")
  })


  //For modifing the details student
  app.put('/Fedit/:id',async(request,response)=>{
    let id = request.params.id
    await Foodmodel.findByIdAndUpdate(id,request.body)
    response.send("Record updated")
  })


  module.exports = app