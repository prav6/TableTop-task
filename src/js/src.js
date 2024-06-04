import axios from 'axios';
import { Garage } from './garage.js';

window.addEventListener("garage-loaded", start, false);

function start() {
    console.log('Garage loaded event caught');
    displayAllCars();  // Display all cars when the garage is loaded
}

// Function to display all cars in the garage
function displayAllCars() {
    const cars = Garage.getAllCars();  // Retrieve all cars from the Garage
    console.log('Displaying cars:', cars);
    const container = document.getElementById('car-info');
    // Clear any existing content in the container
    container.innerHTML = '';
    // Loop through each car in the garage
    cars.forEach(car => {
        if (car && car.reg) {
            console.log('Processing car:', car.reg);
            // Fetch car data using registration number
            fetchCarData(car.reg)
                .then(carData => displayCarData(carData))
                .catch(error => console.error('Failed to fetch data for car', car.reg, error));
        }
    });
}
// Async function to fetch car data from a server
async function fetchCarData(registration) {
    console.log('Fetching data for:', registration);
    // Make a POST request to the proxy server endpoint with registration data localhost:3000
    try {
        const response = await axios.post('http://localhost:3000/vehicle-enquiry', {
            registrationNumber: registration
        });
        const carData = response.data;
        // Fetch the logo URL for the car brand using another API call
        carData.logoUrl = await fetchBrandLogo(carData.make); // Fetch the brand logo
        return carData;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            console.error('Error fetching data for:', registration, ' - Not Found');
        } else {
            console.error('Error fetching data for:', registration, error);
        }
        throw error;
    }
}

// Async function to fetch brand logo URL from a logo service
async function fetchBrandLogo(brand) {
    try {
        const response = await axios.get(`https://logo.clearbit.com/${brand}.com`);
        return response.config.url; // Return the URL of the logo
    } catch (error) {
        console.error('Error fetching logo for brand:', brand, error);
        return 'default-logo.png'; // Fallback to a default logo if the request fails
    }
}

// Function to display car data in the UI
function calculateRemainingDays(expiryDate) {
    const currentDate = new Date('2024-06-04');
    const expiry = new Date(expiryDate);
    const timeDiff = expiry - currentDate;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return daysDiff;
}

// Function to display car data in the UI info on the car
function displayCarData(carData) {
    console.log('Car data received:', carData);
    const container = document.getElementById('car-info');
    const carElement = document.createElement('div');
    carElement.className = 'car-card';

    const remainingDays = calculateRemainingDays(carData.motExpiryDate);

    carElement.innerHTML = `
        <button class="delete-button" onclick="deleteCar('${carData.registrationNumber}')">Delete</button>
        <button class="info-button" onclick="showCarDetails('${carData.registrationNumber}')">i</button>
        <h3>${carData.registrationNumber}</h3>
        <p>Make: ${carData.make}</p>
        <p>MOT Expiry Date: ${carData.motExpiryDate}</p>
        <p>Days Remaining: ${remainingDays}</p>
        <img src="${carData.logoUrl}" alt="Logo of ${carData.make}" onerror="this.onerror=null;this.src='default-logo.png';" />
        ${remainingDays <= 30 ? '<div class="renew-mot">RENEW MOT</div>' : ''}
    `;
    container.appendChild(carElement);


    window.carDetails = window.carDetails || {};
    window.carDetails[carData.registrationNumber] = carData;
}

window.deleteCar = function (registration) {
    console.log(`Attempting to delete car: ${registration}`);
    if (Garage.delete(registration)) {
        console.log(`Car deleted: ${registration}`);
        displayAllCars();
    } else {
        console.log(`Failed to delete car: ${registration}`);
        alert('Failed to delete car');
    }
};

//Show the extra information which is all the other api calls
window.showCarDetails = function (registration) {
    const carData = window.carDetails[registration];
    if (!carData) {
        alert('Car details not found.');
        return;
    }

    const modalContent = `
        <div class="modal-header">
            <h2>Car Details - ${carData.registrationNumber}</h2>
            <span class="close" onclick="closeModal()">&times;</span>
        </div>
        <div class="modal-body">
            <p>Make: ${carData.make}</p>
            <p>MOT Expiry Date: ${carData.motExpiryDate}</p>
            <p>Tax Status: ${carData.taxStatus}</p>
            <p>Tax Due Date: ${carData.taxDueDate}</p>
            <p>MOT Status: ${carData.motStatus}</p>
            <p>MOT Expiry Date: ${carData.motExpiryDate}</p>
            <p>Engine Capacity: ${carData.engineCapacity}</p>
            <p>CO2 Emissions: ${carData.co2Emissions}</p>
            <p>Fuel Type: ${carData.fuelType}</p>
            <p>Colour: ${carData.colour}</p>
            <p>Type Approval: ${carData.typeApproval}</p>
            <p>Wheelplan: ${carData.wheelplan}</p>
            <p>Revenue Weight: ${carData.revenueWeight}</p>
            <p>Real Driving Emissions: ${carData.realDrivingEmissions}</p>
            <p>Date of Last V5C Issued: ${carData.dateOfLastV5CIssued}</p>
            <p>Euro Status: ${carData.euroStatus}</p>
            <p>Automated Vehicle: ${carData.automatedVehicle}</p>
        </div>
    `;

    const modal = document.getElementById('car-modal');
    modal.querySelector('.modal-content').innerHTML = modalContent;
    modal.style.display = 'block';
};

window.closeModal = function () {
    document.getElementById('car-modal').style.display = 'none';
};

// Add event listener to the car registration form
document.getElementById('car-registration-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const registrationInput = document.getElementById('registration-number');
    const regNumber = registrationInput.value.trim().toUpperCase();  // Ensure registration is in uppercase and trimmed
    if (validateRegistrationPlate(regNumber)) {
        if (!Garage.get(regNumber)) {
            Garage.add({ reg: regNumber });
            fetchCarData(regNumber).then(carData => {
                displayCarData(carData);
            }).catch(error => {
                console.error("Error fetching data for new registration", error);
            });
        } else {
            alert("Car with this registration number already exists.");
        }
    } else {
        alert("Invalid registration number");
    }
    registrationInput.value = '';  // Clear input after submission
});

// Validation function for registration plates
function validateRegistrationPlate(regNumber) {
    return /^[A-Z0-9 ]+$/i.test(regNumber);
}

// Ensure the initial cars are added to the garage when the page loads
document.addEventListener("DOMContentLoaded", function() {
    const initialCars = [
        { "reg": "LN07ONS" },
        { "reg": "WG19PZA" },
        { "reg": "LV69VBC" },
        { "reg": "J20ULN" },
        { "reg": "SH53MRA" },
        { "reg": "S11NUC" }

    ];

    initialCars.forEach(car => {
        if (car && car.reg) {
            Garage.add(car);
        }
    });

    window.dispatchEvent(new Event("garage-loaded"));
});
