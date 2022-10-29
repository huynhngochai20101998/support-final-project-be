
// Bring in Models & Helpers
const Subcategory = require('../../models/subcategory');


// Create subcategory
function createSubcategory(req, res) {
    const name = req.body.name;
    const description = req.body.description;
    const category = req.body.category
  
    if (!description || !name) {
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'You must enter name & description.' 
        });
    }

    if (!category ) {
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'You must choose category.' 
        });
    }
  
    const subcategory = new Subcategory({
      name,
      description,
      category
    });
  
    subcategory.save((err, data) => {
      if (err) {
        return res.status(400).json({
          success : false,
          data : null,
          message : 'Your request could not be processed. Please try again.'
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Subcategory has been added successfully!`,
        data : null
      });
    });
  }

// Get all subcategory
async function getAllSubcategory(req, res){
  try {
    const subcategories = await Subcategory.find({}, {id : 1, name : 1,description : 1,isActive : 1});
    res.status(200).json({
      success : true,
      message : "",
      data : subcategories
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}
// Get one category detail
async function getOneSubcategoryById(req, res){
  try {
    const subcategoryId = req.params.id;

    const subcategoryDoc = await Subcategory.findOne({ _id: subcategoryId })

    if (!subcategoryDoc) {
      return res.status(404).json({
        success : false,
        data : null,
        message : 'No subcategory was found.'
      });
    }

    res.status(200).json({
      success : true,
      message : "",
      data: subcategoryDoc
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}

// Update subcategory
async function updateSubcategory(req, res){
  try {
    const subcategoryId = req.params.id;
    const update = req.body;
    const query = { _id: subcategoryId };

    await Subcategory.findOneAndUpdate(query, update, {
      new: true
    });

    res.status(200).json({
      success: true,
      message: 'Subcategory has been updated successfully!',
      data : null
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      data : null,
      message : 'Your request could not be processed. Please try again.'
    });
  }
}


module.exports = {
    createSubcategory,
    getAllSubcategory,
    getOneSubcategoryById,
    updateSubcategory,
};
