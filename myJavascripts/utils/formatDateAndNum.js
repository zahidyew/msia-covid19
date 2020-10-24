function changeDateFormat(date) {
   const year = date.substring(0, 4)
   const month = date.substring(5, 7)
   const day = date.substring(8, 10)
   let textMonth

   month == "01" ? textMonth = "Jan" :
   month == "02" ? textMonth = "Feb" :
   month == "03" ? textMonth = "Mar" :
   month == "04" ? textMonth = "Apr" :
   month == "05" ? textMonth = "May" :
   month == "06" ? textMonth = "Jun" :
   month == "07" ? textMonth = "Jul" :
   month == "08" ? textMonth = "Aug" :
   month == "09" ? textMonth = "Sep" :
   month == "10" ? textMonth = "Oct" :
   month == "11" ? textMonth = "Nov" :
   month == "12" ? textMonth = "Dec" :
   false;

   let reformatted = day + " " + textMonth + " " + year;

   return reformatted;
}

function formatNumber(num) {
   return num = numeral(num).format('0,0');
}