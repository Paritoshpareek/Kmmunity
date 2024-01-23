let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


export const getDay = (timestamp) => {
    try {
        let date = new Date(timestamp);
        // if (isNaN(date.getDate())) {
        //     throw new Error("Invalid timestamp");
        // }

        let day = date.getDate();
        let month = months[date.getMonth()];
        let year = date.getFullYear().toString().slice(-2);

        // Add ordinal suffix to day
        let formattedDay;
        if (day >= 11 && day <= 13) {
            formattedDay = `${day}th`;
        } else {
            switch (day % 10) {
                case 1:
                    formattedDay = `${day}st`;
                    break;
                case 2:
                    formattedDay = `${day}nd`;
                    break;
                case 3:
                    formattedDay = `${day}rd`;
                    break;
                default:
                    formattedDay = `${day}th`;
            }
        }
        formattedDay = (day < 10) ? `0${formattedDay}` : formattedDay;
        return `${formattedDay} ${month} ${year} `;
    } catch (error) {
        console.error("Error in getDay:", error.message);
        return "Invalid Date";
    }
}

export const getFullDay = (timestamp) => {
    try {
        let date = new Date(timestamp);
        if (isNaN(date.getDate())) {
            throw new Error("Invalid timestamp");
        }

        let day = date.getDate();
        let month = months[date.getMonth()];
        let year = date.getFullYear();

        // Ensure a leading zero for single-digit days
        let formattedDay = (day < 10) ? `0${day}` : `${day}`;

        return `${formattedDay} ${month} ${year}`;
    } catch (error) {
        console.error("Error in getFullDay:", error.message);
        return "Invalid Date";
    }
}


// old code to review for NaN dates and add 0 before other dates
// let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
// export const getDay = (timestamp) => {
//     let date = new Date(timestamp);
//     return `${date.getDate()} ${months[date.getMonth()]}`
// }
// export const getFullDay = (timestamp) => {
//     let date = new Date(timestamp);
//     return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
// }