// This a validation file with different types of validation


module.exports.isNullOrUndefind=function (value) {
    if (value ===null || value === undefined ) {
      return true
    } else {
      return false
    }
}
