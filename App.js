import React, { useState } from 'react';
import ReactDOM from "react-dom";
import './App.css';
import './ListItems.css';
import UserDropdown from './UserDropdown.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Select from 'react-select'

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';

library.add(faTrash);

firebase.initializeApp({
    apiKey : "",
    authDomain : "",
    projectId : "",
})

const auth = firebase.auth();
const firestore = firebase.firestore();

let graduationRequirementCategory = ["English", "Math", "Science", "Social Science", "Elective"];

let graduationRequirementEmojiMap = {"english": "📚", 
                                    "math": "📈", 
                                    "science": "🔬", 
                                    "social science": "🌎", 
                                    "elective": "💡"}

let creditsArr = [0.0, 0.0, 0.0, 0.0, 0.0]

let grade9SelectedCourses  = [];
let grade10SelectedCourses = [];
let grade11SelectedCourses = [];
let grade12SelectedCourses = [];

let grade9CourseDropdownList = [];
let grade10CourseDropdownList = [];
let grade11CourseDropdownList = [];
let grade12CourseDropdownList = [];
let dropdownMenuMap = {"9": grade9CourseDropdownList, 
                        "10": grade10CourseDropdownList,
                        "11": grade11CourseDropdownList,
                        "12": grade12CourseDropdownList}

firestore.collection("courses").where("gradesToTake", "array-contains-any", ["9", "10", "11", "12"])
.get()
.then(querySnapshot => {
    querySnapshot.forEach((doc) => {
        if (doc.data().gradesToTake.includes("9")) {
            grade9CourseDropdownList.push({label: doc.id, value: doc.data()})
        }
        if (doc.data().gradesToTake.includes("10")) {
            grade10CourseDropdownList.push({label: doc.id, value: doc.data()})
        }
        if (doc.data().gradesToTake.includes("11")) {
            grade11CourseDropdownList.push({label: doc.id, value: doc.data()})
        }
        if (doc.data().gradesToTake.includes("12")) {
            grade12CourseDropdownList.push({label: doc.id, value: doc.data()})
        }
    });
})
.catch((error) => {
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {  
        firestore.collection('users').doc(user.uid).collection('user_courses').orderBy('addedAt')
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (doc.data().grade === "9") {
                        grade9SelectedCourses.push({key: doc.data().addedAt, value: doc.id, data: doc.data().data});
                        creditsArr[0] += doc.data().data.creditPerTerm * doc.data().data.termsToTake
                    } else if (doc.data().grade === "10") {
                        grade10SelectedCourses.push({key: doc.data().addedAt, value: doc.id, data: doc.data().data});
                        creditsArr[1] += doc.data().data.creditPerTerm * doc.data().data.termsToTake
                    } else if (doc.data().grade === "11") {
                        grade11SelectedCourses.push({key: doc.data().addedAt, value: doc.id, data: doc.data().data});
                        creditsArr[2] += doc.data().data.creditPerTerm * doc.data().data.termsToTake
                    } else if (doc.data().grade === "12") {
                        grade12SelectedCourses.push({key: doc.data().addedAt, value: doc.id, data: doc.data().data});
                        creditsArr[3] += doc.data().data.creditPerTerm * doc.data().data.termsToTake
                    }
                });     
            })
    }
});

let selectedCoursesMap = {"9": grade9SelectedCourses,
                            "10": grade10SelectedCourses,
                            "11": grade11SelectedCourses,
                            "12": grade12SelectedCourses}

class CourseDropdownSingle extends React.Component  {
    constructor(props) {
        super(props);
        this.state = {
            selectOptions: [],
            currentItem: {value: '', key: '', label:'Select a Course', data: {}},
            currentGrade: props.grade,
            items: selectedCoursesMap[props.grade],
            grade9Credits: creditsArr[0],
            grade10Credits: creditsArr[1],
            grade11Credits: creditsArr[2],
            grade12Credits: creditsArr[3],
            cumulativeCredits: 0.0,
            gradeGPA: 0.0,
            auth: props.auth
        };
        this.handleChange = this.handleChange.bind(this);
        this.addItem = this.addItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    removeDuplicateAddedCourse(newItem) {
        for (var i = 9; i <= 12; i++) {
            var i_string = i.toString()
            if (this.state.currentGrade !== i_string) {
                const filteredItems = selectedCoursesMap[i_string].filter(item => item.value !== newItem.value);
                var tempCreditsGrade = 0
                for (var j = 0; j < filteredItems.length; j++) {
                    tempCreditsGrade += filteredItems[j].data.creditPerTerm * filteredItems[j].data.termsToTake
                }
                if (i === 9) {
                    this.setState({grade9Credits: tempCreditsGrade})
                    creditsArr[0] = tempCreditsGrade
                } else if (i === 10) {
                    this.setState({grade10Credits: tempCreditsGrade})
                    creditsArr[1] = tempCreditsGrade
                } else if (i === 11) {
                    this.setState({grade11Credits: tempCreditsGrade})
                    creditsArr[2] = tempCreditsGrade
                } else if (i === 12) {
                    this.setState({grade12Credits: tempCreditsGrade})
                    creditsArr[3] = tempCreditsGrade
                }
                selectedCoursesMap[i_string] = filteredItems;
            }
        }
        this.setState({cumulativeCredits: (this.state.grade9Credits + this.state.grade10Credits + this.state.grade11Credits + this.state.grade12Credits)})
    }
    
    handleChange = (event) => {
        this.setState({currentItem:
            {
                value: event.label,
                key: firebase.firestore.FieldValue.serverTimestamp(),
                label: event.label,
                data: event.value
            }
        })
    }

    getOptions() {
        let groupedOptions = graduationRequirementCategory.map(category => {
            return ({label: `${graduationRequirementEmojiMap[category.toLowerCase()]} ${category}`, options: dropdownMenuMap[this.state.currentGrade].map(course => {
                            if (course.value.graduationRequirementCategory.toLowerCase() === category.toLowerCase()) {
                                return ({value: course.value, label: course.label})
                            }
            }).filter(function(element){return element !== undefined})})})
        this.setState({selectOptions: groupedOptions, 
                    cumulativeCredits: (this.state.grade9Credits + this.state.grade10Credits + this.state.grade11Credits + this.state.grade12Credits)})
    }

    addItem = async (event) => {
        event.preventDefault();
        var stopAddingCourse = 0;
        for (var k = 0; k < selectedCoursesMap[this.state.currentGrade].length; k++) {
            if (selectedCoursesMap[this.state.currentGrade][k].value === this.state.currentItem.value) {
                this.setState({currentItem: {value:'', key:'', label: 'Select a Course'}})
                stopAddingCourse = 1;
                break;
            }
        }
        if (!stopAddingCourse) {
            const newItem = this.state.currentItem;
            if (newItem.value !== undefined && newItem.value !== "") {
                selectedCoursesMap[this.state.currentGrade].push({'key': newItem.key, 'value': newItem.value, 'data': newItem.data})

                if (this.state.auth) {
                    const userData = firestore.collection("users").doc(this.state.auth.currentUser.uid).collection('user_courses').doc(this.state.currentItem.value)
                    await userData.set({
                        grade: this.state.currentGrade,
                        addedAt: newItem.key,
                        data: newItem.data,
                    })
                }
                
                this.setState({items: selectedCoursesMap[this.state.currentGrade], 
                    currentItem: {value:'', key:'', label: 'Select a Course'}})
                
                this.removeDuplicateAddedCourse(newItem)

                this.setState({cumulativeCredits: this.state.cumulativeCredits + newItem.data.creditPerTerm * newItem.data.termsToTake})
                
                if (this.state.currentGrade === "9") {
                    this.setState({grade9Credits: this.state.grade9Credits + newItem.data.creditPerTerm * newItem.data.termsToTake})
                    creditsArr[0] += newItem.data.creditPerTerm * newItem.data.termsToTake
                } else if (this.state.currentGrade === "10") {
                    this.setState({grade10Credits: this.state.grade10Credits + newItem.data.creditPerTerm * newItem.data.termsToTake})
                    creditsArr[1] += newItem.data.creditPerTerm * newItem.data.termsToTake
                }  else if (this.state.currentGrade === "11") {
                    this.setState({grade11Credits: this.state.grade11Credits + newItem.data.creditPerTerm * newItem.data.termsToTake})
                    creditsArr[2] += newItem.data.creditPerTerm * newItem.data.termsToTake
                } else if (this.state.currentGrade === "12") {
                    this.setState({grade12Credits: this.state.grade12Credits + newItem.data.creditPerTerm * newItem.data.termsToTake})
                    creditsArr[3] += newItem.data.creditPerTerm * newItem.data.termsToTake
                }
            }
        }
    }    

    deleteItem = async (deletedItem) => {
        const filteredItems= this.state.items.filter(item => item.value !== deletedItem.value);
        
        this.setState({
            items: filteredItems
        })

        this.setState({cumulativeCredits: this.state.cumulativeCredits - deletedItem.data.creditPerTerm * deletedItem.data.termsToTake})
        if (this.state.currentGrade === "9") {
            this.setState({grade9Credits: this.state.grade9Credits - deletedItem.data.creditPerTerm * deletedItem.data.termsToTake})
            creditsArr[0] -= deletedItem.data.creditPerTerm * deletedItem.data.termsToTake
        } else if (this.state.currentGrade === "10") {
            this.setState({grade10Credits: this.state.grade10Credits - deletedItem.data.creditPerTerm * deletedItem.data.termsToTake})
            creditsArr[1] -= deletedItem.data.creditPerTerm * deletedItem.data.termsToTake
        }  else if (this.state.currentGrade === "11") {
            this.setState({grade11Credits: this.state.grade11Credits - deletedItem.data.creditPerTerm * deletedItem.data.termsToTake})
            creditsArr[2] -= deletedItem.data.creditPerTerm * deletedItem.data.termsToTake
        } else if (this.state.currentGrade === "12") {
            this.setState({grade12Credits: this.state.grade12Credits - deletedItem.data.creditPerTerm * deletedItem.data.termsToTake})
            creditsArr[3] -= deletedItem.data.creditPerTerm * deletedItem.data.termsToTake
        }
        
        selectedCoursesMap[this.state.currentGrade] = filteredItems;
        
        if (this.state.auth) {
            firestore.collection("users").doc(this.state.auth.currentUser.uid).collection('user_courses').doc(deletedItem.value).delete().then(() => {
            }).catch((error) => {
            })
        }

    }

    componentDidMount() {
        this.getOptions()
    }
    
    render() {
        return (
        <div>
            <div id="genStats">
                <h2>Cumulative</h2>
                <h2>Credits: {this.state.cumulativeCredits.toFixed(1)}</h2>
                <br></br>
            </div>
            <header id="GradeCoursePlan" className="list">
                <h1>{this.state.currentGrade}th Grade</h1>
                {this.state.currentGrade === "9" ? (<h2>Credits: {this.state.grade9Credits.toFixed(1)}</h2>) 
                        : this.state.currentGrade === "10" ? (<h2>Credits: {this.state.grade10Credits.toFixed(1)}</h2>)
                        : this.state.currentGrade === "11" ? (<h2>Credits: {this.state.grade11Credits.toFixed(1)}</h2>)
                        : this.state.currentGrade === "12" ? (<h2>Credits: {this.state.grade12Credits.toFixed(1)}</h2>)
                        : <div></div>}
                <form id="course-menu" onSubmit={this.addItem}>
                <Select options={this.state.selectOptions} onChange={this.handleChange.bind(this)} value={this.state.currentItem}/>
                <button type="submit">+</button>
                </form>
                <h1>My Courses</h1>
                <ListItems grade={this.state.currentGrade} deleteItem={this.deleteItem} items={this.state.items}/>
            </header>
        </div>
    );
    }
}

function ListItems(props){
    const items = props.items;
    const listItems = items.map((item) => {
    return <div className="list" key={item.key}>
        <p id="selected-courseoption">
            <input readOnly type="text" id={item.key} value={`${graduationRequirementEmojiMap[item.data.graduationRequirementCategory]} ${item.value}`} />
            <span>
                <FontAwesomeIcon className="faicons" onClick={() => {
                    props.deleteItem(item)
                }} icon="trash" />
            </span>
        </p>
        </div>
    })
    return <div>
        {listItems}
    </div>;
  }

class Grade9CoursePlan extends React.Component {
    render() {
        return (
            <div>
                <CourseDropdownSingle grade="9" items={this.props.items} auth={this.props.auth}/>
            </div>);
    }
}

class Grade10CoursePlan extends React.Component {
    render() {
        return (
            <div>
                <CourseDropdownSingle grade="10" items={this.props.items} auth={this.props.auth}/>
            </div>
        )
    }
}

class Grade11CoursePlan extends React.Component {
    render() {
        return (
            <div>
                <CourseDropdownSingle grade="11" items={this.props.items} auth={this.props.auth}/>
            </div>
        )
    }
}

class Grade12CoursePlan extends React.Component {
    render() {
        return (
            <div>
                <CourseDropdownSingle grade="12" items={this.props.items} auth={this.props.auth}/>
            </div>
        )
    }
}

function CoursePlanner(props) {
    var [selectedGrade, setSelectGrade] = useState(0);
    var exitGuestMode = () => {
        window.location.reload()
    }
    return (
        <div className="App">
            {props.auth != null ? <UserDropdown icon={props.auth.currentUser.photoURL} auth={props.auth} coursesMap={selectedCoursesMap}></UserDropdown> : <div></div>}
            <div id="greetingtext1">
                {props.auth == null ? <button onClick={exitGuestMode} id="exitGuestModeBtn">❌</button> : <> </>}
                <h1 >Welcome {props.auth != null ? props.auth.currentUser.displayName : ""}</h1>
                <button id="gradeSelection" type="submit" onClick={() => {setSelectGrade(9)}}>9</button>
                <button id="gradeSelection" type="submit" onClick={() => {setSelectGrade(10)}}>10</button>
                <button id="gradeSelection" type="submit" onClick={() => {setSelectGrade(11)}}>11</button>
                <button id="gradeSelection" type="submit" onClick={() => {setSelectGrade(12)}}>12</button>
            </div>
            {selectedGrade === 9 ? (<Grade9CoursePlan auth={props.auth}/>) 
            : selectedGrade === 10 ? (<Grade10CoursePlan auth={props.auth}/>)
            : selectedGrade === 11 ? (<Grade11CoursePlan auth={props.auth}/>)
            : selectedGrade === 12 ? (<Grade12CoursePlan auth={props.auth}/>)
            : <div></div>}
        </div>
    );
}

function App() {
    
    const [user] = useAuthState(auth);
    var guest = false;

    function SignIn() {
        const signInWithGoogle = () => {
            const provider = new firebase.auth.GoogleAuthProvider();
            auth.signInWithPopup(provider);
        }
        const userAsGuest = () => {
            ReactDOM.render(
                <React.StrictMode>
                    <CoursePlanner/> 
                </React.StrictMode>,
                document.getElementById("root")
            );
        }
        return (
            <>
            <div id="generalTitle">
                <h1>4 Year Course Planner for High School Students</h1>
                <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
                <br></br>
                <button className="sign-in" onClick={userAsGuest}>Guest Mode</button>
            </div>
            </>
        )
    
    }

    return (
        <div className="App">
            <section>
                {user ? (<CoursePlanner auth={auth}/>) : <SignIn />}
            </section>
            <br></br>
        </div>
    );    
}

export default App;