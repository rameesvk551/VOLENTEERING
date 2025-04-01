class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  filter() {
    let queryObj = { ...this.queryStr };
    const excludeFields = ["sort", "page", "limit"];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  paginate(limit = 10) {
    const page = this.queryStr.page * 1 || 1;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }

  sort() {
    if (this.queryStr.sort) {
      this.query = this.query.sort(this.queryStr.sort);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
}

module.exports = ApiFeatures; // Change export syntax
