const Court = require('../models/Court');

exports.createCourt = async(req,res) =>{
    try{
        const {name , courtNumber,isActive } = req.body 
        
        const court = new Court({
            name,
            courtNumber,
            isActive 
        });
        await court.save()
        res.status(201).json(court)
    } catch (error) {
        console.error('createCourt 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

exports.getAllCourts = async(req,res) =>{
    try{
        const courts = await Court.find()
        res.status(200).json(courts)
    } catch(error) {
        console.error('getAllCourts 錯誤:', error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

exports.getCourt = async(req,res) =>{
    try{
        const court = await Court.findById(req.params.id);

        if(!court) {
            return res.status(404).json({message:'找不到場地'});
        }
        res.status(200).json(court);
    } catch(error) {
        console.error('getCourt錯誤:',error);
        res.status(500).json({ message: '服務器錯誤' });
    }
}

exports.updateCourt = async(req,res) =>{
    try{
        const {name , courtNumber , isActive} = req.body;

        const court = await Court.findByIdAndUpdate(
            req.params.id,
            {name,courtNumber,isActive},
            {new:true}
        );
        if(!court){
            return res.status(404).json({ message: '找不到場地' });
        }
        res.status(200).json(court);
    } catch(error) {
        console.error('updateCourt 錯誤',error)
        res.status(500).json({message: '服務器錯誤'})
    }
}

// 刪除場地
exports.deleteCourt = async (req, res) => {
    try {
      const court = await Court.findByIdAndDelete(req.params.id);
      
      if (!court) {
        return res.status(404).json({ message: '找不到場地' });
      }
      
      res.status(200).json({ message: '場地已刪除' });
    } catch (error) {
      console.error('deleteCourt 錯誤:', error);
      res.status(500).json({ message: '服務器錯誤' });
    }
  };