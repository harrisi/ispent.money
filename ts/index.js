var Student = /** @class */ (function () {
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = "".concat(firstName, " ").concat(middleInitial, " ").concat(lastName);
    }
    return Student;
}());
function greeter(person) {
    return "Hello, ".concat(person.firstName, " ").concat(person.lastName);
}
var user = new Student("Jane", "M.", "User");
document.body.textContent = greeter(user);
