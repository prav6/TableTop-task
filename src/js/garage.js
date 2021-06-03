
const garage = {
    "count": 1,
    "cars":[{'reg':'AA19 AAA'},{'rag':'AA19EEE'},{}]
};

export const Garage = {   
    add(value){
        garage.cars[garage.count] = value;
    },
    delete(reg){
        garage.count--;
        return  garage.cars[0];
    },
    get(reg){
        garage.count += 1;
        return garage.cars[garage.count];
    }
}