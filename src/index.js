const betaCalendar = (function () {
  // PRIVATE variables
  // Default values for global variables needed by betaCalendar
  let MAX_DATE_GLOBAL = 10
  let DATE_LENGTH_GLOBAL = 3;
  let TIME_SLOT_MIN_GLOBAL = "01:00";
  let TIME_SLOT_MAX_GLOBAL = "23:00";
  let TIME_SLOT_INTERVAL_GLOBAL = 60;

  // PRIVATE methods
  // This method is used to provide functionality to shift the desired window right or left.
  function changeDateRange(arrow) {
    
    // Get date range from heading - which is called date_range
    let dateRange = document.getElementById('date_range')

    // Initialise the day variable
    let day = 0

    // Get the first day as a number
    if (dateRange.innerText.split(" ")[0].includes("st")){
        day = dateRange.innerText.split("st")[0]
    } else if (dateRange.innerText.split(" ")[0].includes("nd")){
        day = dateRange.innerText.split("nd")[0]
    }else if (dateRange.innerText.split(" ")[0].includes("rd")){
        day = dateRange.innerText.split("rd")[0]
    }else if (dateRange.innerText.split(" ")[0].includes("th")){
        day = dateRange.innerText.split("th")[0]
    }

    // Get first month
    const month = dateRange.innerText.split(" ")[1]

    // Get year
    const year = new Date().getFullYear()

    // So, the first date is...
    const firstDate = new Date((`${month} ${day}, ${year}`))

    
    if (arrow == "left"){
        // If arrow is left - so the client wishes to book a sooner date then check if arrow_left is greyed out.
        // If arrow_left is greyed out it indicates the client cannot move to a sooner date. Log that in the client's console.
        if (document.getElementById('arrow_left').style.color == 'grey'){console.log("can't move back")}
        // If can go back to a sooner time window, do - by invoking the changeCalendarWindow function.
        else{changeCalendarWindow(arrow, firstDate)}

    }else{

      if(document.getElementById("arrow_right").style.color == 'grey'){console.log("can't move beyond these dates")}
      else{changeCalendarWindow(arrow, firstDate)}
    }   
  }

  // This method is used to change theCalendarWindow (e.g from 4th to 6th of August to 7th to 9th of August)
  function changeCalendarWindow(arrow, currentFirstDate) {

    // Get milliseconds in one day
    const one_day = 1000 * 60 * 60 * 24 //milliseconds in a day

    // Create new date object
    const newDate = new Date();

    // Set that date back or forward by DATE_LENGTH_GLOBAL, depending on if the right or left arrow has been pressed by the client
    if (arrow == "right"){newDate.setTime(currentFirstDate.getTime() + DATE_LENGTH_GLOBAL*one_day)}
    else{newDate.setTime(currentFirstDate.getTime() - DATE_LENGTH_GLOBAL*one_day)}

    // Compare newDate with today
    const today = new Date();
    const new_start_date = Math.round(newDate - today) / one_day

    // Clear existing radio buttons
    document.getElementById("day_form").innerHTML = "";
    document.getElementById("time_form").innerHTML = "";

    // Regenerate the calendar
    makeChanges(new_start_date, MAX_DATE_GLOBAL, DATE_LENGTH_GLOBAL, TIME_SLOT_MIN_GLOBAL, TIME_SLOT_MAX_GLOBAL, TIME_SLOT_INTERVAL_GLOBAL)
  }

  // This method is used to get the suffix to be added to each date
  function getOrdinalSuffix(n) {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  // This method used to get a range of dates within the calendar window
  function getDateRange(start, length) {

    // Initialise a string which will be appended to
    let dateWhole = ""

    // Get today as a date object
    const today = new Date();

    // Use the start date and the length of range to calculate allDates and a dateRange
    for (let k = start; k < start + length; k = k + 1){
        const newDate = new Date();
        newDate.setDate(today.getDate() + k);
        const day = newDate.getDate();
        const month = newDate.toLocaleString('default', {month:'long'});

        dateWhole = dateWhole + `${day}${getOrdinalSuffix(day)} ${month}, `;
    }

    // Get array of dates
    const allDates = dateWhole.slice(0, -2).split(",");

    // Get range of dates
    const dateRange = `${allDates[0]} - ${allDates[allDates.length - 1]}`

    return {allDates, dateRange}
  }

  // This method is used to generate radio button for days
  function generateDayRadioButtons(allDates) {

    // Get day_form html element
    const day_form = document.getElementById('day_form');

    // Create the number of columns as there are dates in the dateRange
    day_form.style.gridTemplateColumns = allDates.length * "1fr ";

    // Initialise count
    count = 1
  
    // Iterate across each date in the date range and create a radio input element and an associated label
    allDates.forEach(date => {
        const radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', "day");
        radio.setAttribute('id', date)
        count += 1

        const label = document.createElement('label');
        label.setAttribute('for', date);
        label.style.display = 'grid'
        label.style.gridColumn = count
        label.textContent = date;
        label.classList.add('custom-button');

        day_form.appendChild(radio);
        day_form.appendChild(label);
    });
  }

  // This method is used to generate time slots which are available based on a start and end date and on an interval (e.g every 30 mins)
  function getTimeSlots(start, end, interval) {

    const formatTime = (date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const times = [];
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startDate = new Date();
    startDate.setHours(startHour, startMin, 0, 0);

    const endDate = new Date();
    endDate.setHours(endHour, endMin, 0, 0);

    const intervalMs = interval * 60 * 1000; // convert minutes to milliseconds

    while (startDate <= endDate) {
        times.push(formatTime(startDate));
        startDate.setTime(startDate.getTime() + intervalMs);
    }

    return times;
    }

  // This method is used to generate radio button for times
  function generateTimeRadioButtons(allDates, allTimes) {

    // Get time form html element
    const time_form = document.getElementById('time_form');

    // Create the number of columns as there are dates in the dateRange
    time_form.style.gridTemplateColumns = allDates.length * "1fr ";

    // Initialise count
    count = 1

    // Iterate across each time in the time range, considering the time interval, and create a radio input element and an associated label
    allTimes.forEach(time => {
        const radio = document.createElement('input');
        radio.setAttribute('type', 'radio');
        radio.setAttribute('name', "time");
        radio.setAttribute('id', time)

        const label = document.createElement('label');
        label.setAttribute('for', time);
        label.style.display = 'grid'
        label.style.gridColumn = count
        label.classList.add('custom-button');
        label.textContent = time;


        if(count == allDates.length){count = 1}
        else{count += 1}

        time_form.appendChild(radio);
        time_form.appendChild(label);
    });
  }

  // PUBLIC method
  function makeChanges(start_distance_from_today, max_distance_from_today, date_length, time_slot_min, time_slot_max, time_slot_interval) {
    
    // Reassign GLOBAL variables based on user inputs
    MAX_DATE_GLOBAL = max_distance_from_today
    DATE_LENGTH_GLOBAL = date_length;
    TIME_SLOT_MIN_GLOBAL = time_slot_min;
    TIME_SLOT_MAX_GLOBAL = time_slot_max;
    TIME_SLOT_INTERVAL_GLOBAL = time_slot_interval;

    // Get dates and times
    const { allDates, dateRange } = getDateRange(start_distance_from_today, DATE_LENGTH_GLOBAL);
    const allTimes = getTimeSlots(TIME_SLOT_MIN_GLOBAL, TIME_SLOT_MAX_GLOBAL, TIME_SLOT_INTERVAL_GLOBAL);

    // Set heading to a new dateRange
    document.getElementById('date_range').innerText = dateRange;

    // Generate a new set of buttons
    generateDayRadioButtons(allDates);
    generateTimeRadioButtons(allDates, allTimes);

    // Add logic to bound the calendar (e.g can only book from and to certain point)
    if (start_distance_from_today <= 2) {
      document.getElementById("arrow_left").style.color = 'grey';
    } else {
      document.getElementById("arrow_left").style.color = 'black';
    }

    if(start_distance_from_today + DATE_LENGTH_GLOBAL >= MAX_DATE_GLOBAL){document.getElementById("arrow_right").style.color='grey'}
    else{document.getElementById("arrow_right").style.color='black'}
  }

  return {
    makeChanges,
    _changeDateRange: changeDateRange,
  };
})();

export default betaCalendar