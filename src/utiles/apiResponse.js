class apiResponse {
  constructor(statuscode, data, message = "Success"){
    this.statuscode = statuscode
    this.data = data
    this.success = statuscode < 400
  }
}