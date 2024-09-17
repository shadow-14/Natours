 class APIFeatures{
    constructor(query,queryString){
    this.query = query;
    this.queryString = queryString;
    }
    
    filter(){
      const queryobj = { ...this.queryString }; // in js const a = b in object make a reference rather than the new object to make new copy of that we have to destructure and then use curly brackets
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryobj[el]);
      // console.log(req.query, queryobj);
      //
    
      // 1 B) Advanced filtering
    
      let queryStr = JSON.stringify(queryobj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      // console.log(JSON.parse(queryStr));
      this.query = this.query.find(JSON.parse(queryStr))
      // let query = Tour.find(JSON.parse(queryStr));
    return this;
    
    }
    
    sort(){
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        console.log(sortBy);
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
    
      return this;
    }
    
    limitField(){
    if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
    pagination(){
      const page = this.queryString.page*1 || 1  ;//by default ||
      const limit = this.queryString.limit*1 || 100;
      const skip = (page-1)*limit;
      // page=2&limit=10,1-10,page1 ,11-20,page 2...
       this.query = this.query.skip(skip).limit(limit);
    
      return this;
    }
    
    }
module.exports= APIFeatures;
