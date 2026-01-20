import React, { useEffect } from 'react';
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import classnames from 'classnames';

import SettingsIcon from '@mui/icons-material/Settings';
import GithubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';

import { Fab, IconButton } from '@mui/material';
import { connect } from 'react-redux';
// styles
import useStyles from './styles';

// components
import Header from '../Header';
import Sidebar from '../Sidebar';
import Footer from '../Footer';
import { Link } from '../Wrappers';
import ColorChangeThemePopper from './components/ColorChangeThemePopper';

import EditUser from '../../pages/user/EditUser';

// pages
import Dashboard from '../../pages/dashboard';
import Profile from '../../pages/profile'

import Ecommerce from '../../pages/ecommerce'
import Product from '../../pages/products/Product';
import ProductsGrid from '../../pages/ecommerce/ProductsGrid'
import CreateProduct from '../../pages/ecommerce/CreateProduct'

// import MapsGoogle from '../../pages/maps'
// import VectorMaps from '../../pages/maps/VectorMap'

import System from '../../pages/systems/System';
import AddSystem from '../../pages/systems/AddSystem';

// context
import { useLayoutState } from '../../context/LayoutContext';
import { ProductsProvider } from '../../context/ProductContext'

// import UsersFormPage from 'pages/CRUD/Users/form/UsersFormPage';
// import UsersTablePage from 'pages/CRUD/Users/table/UsersTablePage';
import UsersTable from '../../pages/CRUD/Users/table/UsersTable';

//Sidebar structure
import { useSidebarStructure } from '../Sidebar/SidebarStructure';
import CourseAdd from '../../pages/ecommerce/CourseAdd';
import CourseVideoAdd from '../../pages/ecommerce/CourseVideoAdd';
import EventAdd from '../../pages/events/EventAdd';
import Event from '../../pages/events/Event';
import UserAdd from '../../pages/CRUD/Users/table/UserAdd';
import ScannerComponent from '../../pages/scanner/scanner';
import UsersTablePage from '../../pages/CRUD/Users/table/UsersTablePage';
import AddProduct from '../../pages/products/AddProduct';
import Order from '../../pages/orders/Order';
import Lottery from '../../pages/lottery/lottery';
import Live from '../../pages/lives/Live';
import AddLive from '../../pages/lives/AddLive';
// import Secrets from '../../pages/secretsComponent/secrets';
// import AddSecret from '../../pages/secretsComponent/Addsecret';

// const Redirect = (props) => {
//   useEffect(() => window.location.replace(props.url));
//   return <span>Redirecting...</span>;
// };

function Layout(props) {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const structure = useSidebarStructure();

  const open = Boolean(anchorEl);
  const id = open ? 'add-section-popover' : undefined;
  const handleClick = (event) => {
    setAnchorEl(open ? null : event.currentTarget);
  };

  // global
  let layoutState = useLayoutState();

  return (
    <div className={classes.root}>
      <Header history={props.history} />
      <Sidebar structure={structure} />
      <div
        className={classnames(classes.content, {
          [classes.contentShift]: layoutState.isSidebarOpened,
        })}
      >
        <div className={classes.fakeToolbar} />
        <Switch>
          <Route 
            exact 
            path="/" 
            render={() => <Redirect to="/dashboard" />} 
          />
          <Route path='/dashboard' component={Dashboard} />
          <Route path="/profile" component={Profile} />
          <Route path='/user/edit' component={EditUser} />

          <Route path="/scanner" component={ScannerComponent} />

          <Route
            exact
            path="/system"
            render={() => <Redirect to="/system/list" />}
          />

          {/* Página de lista de sistemas */}
          <Route path="/system/list" component={System} />

          {/* Página para agregar un sistema */}
          <Route path="/system/addsystem" component={AddSystem} />
          <Route path="/system/editsystem/:id" component={AddSystem} />

          <Route
            exact
            path="/secrets"
            render={() => <Redirect to="/secrets/list" />}
          />

          {/* Página de lista de secretos */}
          {/* <Route path="/secrets/list" component={Secrets} /> */}
          
          {/* Página para agregar un secreto */}
          {/* <Route path="/secrets/addsecret" component={AddSecret} /> */}
          {/* <Route path="/secrets/editsecret/:id" component={} /> */}

          {/* Página de lista de productos */}
          <Route path="/product/list" component={Product} />

          {/* Página para agregar un sistema */}
          <Route path="/product/addproduct" component={AddProduct} />
          <Route path="/product/editproduct/:id" component={AddProduct} />

          <Route
            exact
            path="/salon_of_your_dreams"
            render={() => <Redirect to="/salon_of_your_dreams/orders" />}
          />

          {/* Página de lista de sistemas */}
          <Route path="/salon_of_your_dreams/orders" component={Order} />
          <Route path="/salon_of_your_dreams/lottery" component={Lottery} />

          <Route
            exact
            path="/lives"
            render={() => <Redirect to="/lives/live_playlist" />}
          />

          {/* Página de lista de lives */}
          <Route path="/lives/live_playlist" component={Live} />
          <Route path="/lives/addlive" component={AddLive} />
          <Route path="/lives/editlive/:id" component={AddLive} />


          <Route
            exact
            path="/event"
            render={() => <Redirect to="/events/list" />}
          />

          {/* Página de lista de sistemas */}
          <Route path="/events/list" component={Event} />

          {/* Página para agregar un sistema */}
          <Route path="/events/addevent" component={EventAdd} />
          <Route path="/events/editevent/:id" component={EventAdd} />

          <Route path="/ecommerce/management" exact>
            <ProductsProvider>
              <Ecommerce />
            </ProductsProvider>
          </Route>
          <Route path="/ecommerce/management/edit/:id" exact>
            <ProductsProvider>
              <CreateProduct />
            </ProductsProvider>
          </Route>
          <Route path="/ecommerce/management/create">
            <ProductsProvider>
              <CreateProduct />
            </ProductsProvider>
          </Route>
          <Route path="/ecommerce/product/:id" component={Product} />
          <Route path="/ecommerce/product" component={Product} />
          <Route path="/ecommerce/gridproducts" component={ProductsGrid} />
          <Route path="/ecommerce/courseadd" component={CourseAdd} />
          <Route path="/ecommerce/coursevideoadd/:id" component={CourseVideoAdd} />
          <Route exact path="/ecommerce/edit/:id" component={CourseAdd} />

          <Route path={'/users/list'} exact component={UsersTablePage} />
          <Route path={'/users/useradd'} exact component={UserAdd} />
        </Switch>
        <ColorChangeThemePopper id={id} open={open} anchorEl={anchorEl} />
        {/* <Footer>
          <div>
            <Link
              color={'primary'}
              href={'https://flatlogic.com/'}
              target={'_blank'}
              className={classes.link}
            >
              Flatlogic
            </Link>
            <Link
              color={'primary'}
              href={'https://flatlogic.com/about'}
              target={'_blank'}
              className={classes.link}
            >
              About Us
            </Link>
            <Link
              color={'primary'}
              href={'https://flatlogic.com/blog'}
              target={'_blank'}
              className={classes.link}
            >
              Blog
            </Link>
          </div>
          <div>
            <Link href={'https://www.facebook.com/flatlogic'} target={'_blank'}>
              <IconButton aria-label='facebook'>
                <FacebookIcon style={{ color: '#6E6E6E99' }} />
              </IconButton>
            </Link>
            <Link href={'https://twitter.com/flatlogic'} target={'_blank'}>
              <IconButton aria-label='twitter'>
                <TwitterIcon style={{ color: '#6E6E6E99' }} />
              </IconButton>
            </Link>
            <Link href={'https://github.com/flatlogic'} target={'_blank'}>
              <IconButton
                aria-label='github'
                style={{ padding: '12px 0 12px 12px' }}
              >
                <GithubIcon style={{ color: '#6E6E6E99' }} />
              </IconButton>
            </Link>
          </div>
        </Footer> */}
      </div>
    </div>
  );
}

export default withRouter(connect()(Layout));