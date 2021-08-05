import './UserDropdown.css';
import React, { useState, useEffect, useRef } from 'react';
import { CSSTransition } from 'react-transition-group';

function UserDropdown(props) {
  return (
    <Navbar>
      <NavItem imgSrc={props.icon}>
        <DropdownMenu auth={props.auth}></DropdownMenu>
      </NavItem>
    </Navbar>
  );
}

function Navbar(props) {
  return (
    <nav className="navbar">
      <ul className="navbar-nav">{props.children}</ul>
    </nav>
  );
}

function NavItem(props) {
  const [open, setOpen] = useState(false);

  return (
    <li className="nav-item">
      <a href="#" className="icon-button" onClick={() => setOpen(!open)}>
        <img id="userAcctIcon" src={props.imgSrc} alt=""></img>
      </a>

      {open && props.children}
    </li>
  );
}

function DropdownMenu(props) {
  const [activeMenu, setActiveMenu] = useState('main');
  const [menuHeight, setMenuHeight] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMenuHeight(dropdownRef.current?.firstChild.offsetHeight)
  }, [])

  const signOutRefresh = async () => {
    await window.location.reload()
    await props.auth.signOut()
  }

  function calcHeight(el) {
    const height = el.offsetHeight;
    setMenuHeight(height);
  }

  function DropdownItem(props) {
    return (
      <a href="#" className="menu-item" onClick={() => props.goToMenu && setActiveMenu(props.goToMenu)}>
        <span className="icon-button">{props.leftIcon}</span>
        {props.children}
        <span className="icon-right">{props.rightIcon}</span>
      </a>
    );
  }

  return (
    <div className="dropdown" style={{ height: menuHeight }} ref={dropdownRef}>

      <CSSTransition
        in={activeMenu === 'main'}
        timeout={500}
        classNames="menu-primary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem
            goToMenu="english"
            leftIcon="📚">
            English
          </DropdownItem>
          <DropdownItem
            goToMenu="math"
            leftIcon="📈">
                      Math
          </DropdownItem>
          <DropdownItem
            goToMenu="science"
            leftIcon="🔬">
                      Science
          </DropdownItem>
          <DropdownItem
            goToMenu="socialscience"
            leftIcon="🌎">
                      Social Science
          </DropdownItem>
          {/* <DropdownItem
            goToMenu="foreignlanguage"
            leftIcon="🌍">
                      Foreign Language
          </DropdownItem> */}
          <DropdownItem
            goToMenu="elective"
            leftIcon="💡">
            Elective
          </DropdownItem>
          <DropdownItem goToMenu={() => signOutRefresh()} leftIcon="❌">Sign Out</DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'english'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon="📚">
            <h2>English</h2>
          </DropdownItem>
          <DropdownItem>Novel</DropdownItem>
          <DropdownItem>Poem</DropdownItem>
          <DropdownItem>Essay</DropdownItem>
          <DropdownItem>Article</DropdownItem>
        </div>
      </CSSTransition>

      <CSSTransition
        in={activeMenu === 'math'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon="📈">
            <h2>Math</h2>
          </DropdownItem>
          <DropdownItem>Graph</DropdownItem>
          <DropdownItem>Ruler</DropdownItem>
          <DropdownItem>Calculator</DropdownItem>
          <DropdownItem>Pencil</DropdownItem>
        </div>
      </CSSTransition>
      

      
      <CSSTransition
        in={activeMenu === 'science'}
        timeout={500}
        classNames="menu-secondary"
        unmountOnExit
        onEnter={calcHeight}>
        <div className="menu">
          <DropdownItem goToMenu="main" leftIcon="🔬">
            <h2>Science</h2>
          </DropdownItem>
          <DropdownItem>Microscope</DropdownItem>
          <DropdownItem>Beaker</DropdownItem>
          <DropdownItem>Flask</DropdownItem>
          <DropdownItem>Discovery</DropdownItem>
        </div>
      </CSSTransition>


          <CSSTransition
              in={activeMenu === 'socialscience'}
              timeout={500}
              classNames="menu-secondary"
              unmountOnExit
              onEnter={calcHeight}>
              <div className="menu">
                  <DropdownItem goToMenu="main" leftIcon="🌎">
                      <h2>Social Science</h2>
                  </DropdownItem>
                  <DropdownItem>Elephant</DropdownItem>
                  <DropdownItem>Frog</DropdownItem>
                  <DropdownItem>Giraffe</DropdownItem>
                  <DropdownItem>Monkey</DropdownItem>
              </div>
          </CSSTransition>
          {/* <CSSTransition
              in={activeMenu === 'foreignlanguage'}
              timeout={500}
              classNames="menu-secondary"
              unmountOnExit
              onEnter={calcHeight}>
              <div className="menu">
                  <DropdownItem goToMenu="main" leftIcon="🌍">
                      <h2>Foreign Language</h2>
                  </DropdownItem>
                  <DropdownItem></DropdownItem>
                  <DropdownItem></DropdownItem>
                  <DropdownItem></DropdownItem>
                  <DropdownItem></DropdownItem>
              </div>
          </CSSTransition> */}
          <CSSTransition
              in={activeMenu === 'elective'}
              timeout={500}
              classNames="menu-secondary"
              unmountOnExit
              onEnter={calcHeight}>
              <div className="menu">
                  <DropdownItem goToMenu="main" leftIcon="💡">
                      <h2>Elective</h2>
                  </DropdownItem>
                  <DropdownItem>One</DropdownItem>
                  <DropdownItem>Two</DropdownItem>
                  <DropdownItem>Three</DropdownItem>
                  <DropdownItem>Four</DropdownItem>
              </div>
          </CSSTransition>
      </div>
  );
}

export default UserDropdown;