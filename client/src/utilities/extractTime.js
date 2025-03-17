export function extractDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    // Check if the date is today
    const isToday = date.getDate() === now.getDate() &&
                    date.getMonth() === now.getMonth() &&
                    date.getFullYear() === now.getFullYear();

    // Helper function to format time in 12-hour format
    const formatTime = (date) => {
        let hours = date.getHours();
        const minutes = padZero(date.getMinutes());
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12; // Convert to 12-hour format
        hours = hours ? padZero(hours) : '12'; // Convert hour '0' to '12'
        return `${hours}:${minutes} ${ampm}`;
    };

    if (isToday) {
        // Return only the time in 12-hour format
        return `Today at ${formatTime(date)}`;
    } else {
        // Return the full date in "MMM D, YYYY" format along with time
        const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        const formattedTime = formatTime(date);
        return `${formattedDate} at ${formattedTime}`;
    }
}

function padZero(number) {
    return number.toString().padStart(2, "0");
}
