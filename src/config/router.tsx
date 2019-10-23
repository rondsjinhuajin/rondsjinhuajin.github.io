import Home from '../components/Home'
import Dashboard from '../components/Dashboard'
import About from '../components/About'
import BasicLayout from '../layouts/BasicLayout'

export default [
    {
        path: "/",
        name: 'Home',
        component: Home
    },
    {
        path: "/about",
        name: 'About',
        component: About
    },
    {
        path: "/jinhuajin",
        name: 'Index',
        component: BasicLayout
    },
    {
        path: "/dashboard",
        name: 'Dashboard',
        component: Dashboard
    }
];