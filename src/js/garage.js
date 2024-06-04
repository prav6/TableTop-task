//array to store the cars
const garage = {
    cars: []
};

export const Garage = {
    // Check if the car object is valid
    // and if it doesn't already exist in the garage (using the get method).
    add(car) {
        if (car && car.reg && !this.get(car.reg)) {
            garage.cars.push(car);
            console.log(`Car added: ${car.reg}`);
        } else {
            console.log(`Car already exists or invalid: ${car ? car.reg : car}`);
        }
    },
    delete(reg) {
        // Try to find the index of the car with the given registration number to remove from array
        const index = garage.cars.findIndex(car => car.reg === reg);
        if (index !== -1) {
            const deletedCar = garage.cars.splice(index, 1);
            console.log(`Car deleted: ${deletedCar[0].reg}`);
            return true;
        } else {
            console.log(`Car not found: ${reg}`);
            return false;
        }
    },
    get(reg) {
        // Try to find the car with the given registration number
        const car = garage.cars.find(car => car.reg === reg);
        if (car) {
            console.log(`Car found: ${car.reg}`);
        } else {
            console.log(`Car not found: ${reg}`);
        }
        return car;
    },
    getAllCars() {
        // Log the number of cars in the garage and return the entire "cars" array
        console.log(`Getting all cars: ${garage.cars.length} cars found`);
        return garage.cars;
    }
};
