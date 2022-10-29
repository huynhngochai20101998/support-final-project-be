
// Bring in Models & Helpers
const Category = require('../../models/category');
const Subcategory =  require('../../models/subcategory');
//const Product = require('../../models/product');


// Create category
async function createCategory(req, res) {
  try{
  const name = req.body.name;
    const description = req.body.description;
  
    if (!description || !name) {
      return res
        .status(400)
        .json({
          success : false,
          data : null,
          message : 'You must enter name & description.' });
    }
   const isLoop = await Category.findOne({name : name})
    console.log(isLoop);
    if(isLoop){
      return res
        .status(400)
        .json({ 
          success : false,
          data : null,
          message : 'This category name is already exist!' 
        });
    }
  
    const category = new Category({
      name,
      description
    });
  
    category.save((err, data) => {
      if (err) {
        return res.status(400).json({
          success : false,
          message : 'Your request could not be processed. Please try again.',
          data : null
        });
      }
  
      res.status(200).json({
        success: true,
        message: `Category has been added successfully!`,
        category: data
      });
    });
  }catch(error){
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
  }

// Update category
async function updateCategory(req, res){
  try {
    const categoryId = req.params.id;
    const update = req.body;
    const query = { _id: categoryId };

    const categoryDoc = await Category.findOneAndUpdate(query, update, {
      new: true
    });
    if (!categoryDoc) {
      res.status(404).json({
        success : false,
        message: `Cannot find category with the id: ${categoryId}.`,
        data : null
      });
    }
    res.status(200).json({
      success: true,
      message: 'Category has been updated successfully!'
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}

// Get all category for admin
async function getAllCategoriesForAdmin(req, res){
  try{
    const categories = await Category.find({});
    const data = [];
    await Promise.all(categories.map(async (category,index) => {
        const subcategories = await Subcategory.find({category : category._id}, {id : 1, name : 1, slug : 1,description : 1});
        data.push({
            _id: category._id,
           name: category.name,
           slug : category.slug,
           description : category.description,
           subcategories : subcategories
          });
  }));
  data.sort((a, b) => {
    let fa = a.name.toLowerCase(),
        fb = b.name.toLowerCase();

    if (fa < fb) {
        return -1;
    }
    if (fa > fb) {
        return 1;
    }
    return 0;
});
 data.push(data.splice(3, 1)[0]);
  res.status(200).json({
    success : true,
    message : "",
    data : data
  });
  //   const getData = new Promise((resolve,reject) => {
  //     categories.map(async (category, index, array) => {
  //       console.log(index);
  //       const subcategories = await Subcategory.find({category : category._id}, {id : 1, name : 1,description : 1});
  //       console.log(` => ${index}`);
  //       data.push({
  //           _id: category._id,
  //          name: category.name,
  //          description : category.description,
  //          subcategories : subcategories
  //         });
          
  //         if (index === array.length -1) {
  //           console.log(data.length);
  //           resolve();
  //         }

  //   });
  // });
  // await getData.then(() => {
  //   res.status(200).json({
  //     success : true,
  //     message : "",
  //     data : data
  //   });
  // });
  }catch(error) {
      console.log(error);
      res.status(400).json({
        success : false,
        message : 'Your request could not be processed. Please try again.',
        data : null
      });
    }
  }
//Get all categories for user
async function getCategoriesForUser(req,res) {
  try{
  const categories = await  Category.find({});
  const data = [];
  var getData = new Promise((resolve,reject) => {
    categories.forEach(async (category, index, array) => {
      const subcategories = await Subcategory.find({category : category._id}, {id : 1, name : 1,slug : 1});
      data.push({
          _id: category._id,
         name: category.name,
         slug : category.slug,
          subcategories : subcategories
        });
        if (index === array.length -1) resolve();
  });
});
getData.then(() => {
  res.status(200).json({
    success : true,
    message : "",
    data : data
  });
});
}catch(error) {
    console.log(error);
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}
// Get all subcategories of a category
async function getAllSubcategories(req, res){
  try {
    const categoryId =  req.params.id;
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        message: `No category found with the id ${categoryId} .`
      });
    }
    const subcategories = await Subcategory.find({category : categoryId},{id : 1, name : 1,description : 1,isActive : 1});
    res.status(200).json({
      success : true,
      message : "",
      data : subcategories
    });
  } catch (error) {
    res.status(400).json({
      success : false,
      message : 'Your request could not be processed. Please try again.',
      data : null
    });
  }
}
// Create subcategory
async function createSubcategory(req, res) {
try{
  const categoryId = req.params.id;
  const category = await Category.findOne({_id : categoryId},{_id : 1});
  if(!category){
    res.status(404).json({
      success : false,
      message : `Can not find category with the id ${categoryId}`,
      data : null
    })
  }
  const name = req.body.name;
  const description = req.body.description;

  if (!description || !name) {
    return res
      .status(400)
      .json({ 
        success : false,
        data : null,
        message : 'You must enter name & description.' 
      });
  }
  const isLoop = await Subcategory.findOne({name : name});
  if(isLoop){
    return res
      .status(400)
      .json({ 
        success : false,
        data : null,
        message : 'This subcategory name is already exist!' 
      });
  }

  const subcategory = new Subcategory({
    name,
    description,
    category
  });

  subcategory.save((err, data) => {
    if (err) {
      console.log(err);
      return res.status(400).json({
        success : false,
        message : 'Your request could not be processed. Please try again.',
        data : null
      });
    }

    res.status(200).json({
      success: true,
      message: `Subcategory has been added successfully!`,
      data : subcategory
    });
  });
}catch(error) {
  return res.status(400).json({
    success : false,
    message : 'Your request could not be processed. Please try again.',
    data : null
  });
}
}
async function getOneCategoryById(req, res){
  try {
    const categoryId = req.params.id;

    const categoryDoc = await Category.findOne({ _id: categoryId })

    if (!categoryDoc) {
      return res.status(404).json({
        success : false,
        data : null,
        message : 'No Category was found.'
      });
    }

    res.status(200).json({
      success : true,
      message : "",
      data: categoryDoc
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

module.exports = {
    createCategory,
    updateCategory,
    getAllCategoriesForAdmin,
    getCategoriesForUser,
    getAllSubcategories,
    createSubcategory,
    getOneCategoryById
};
