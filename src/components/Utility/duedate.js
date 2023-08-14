
const calculateTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const timeDiff = due - now;
    const daysRemaining = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    let remainingTime = `${daysRemaining} days ${hoursRemaining} hours`;

    if (daysRemaining === 0 && hoursRemaining < 24) {
        remainingTime += ` (Less than 24 hours)`;
    }
    return remainingTime;
};
export default calculateTimeRemaining