function iwebFunc() {
    iweb.bindEvent('click', 'header.page-header div.menu > a', function() {
        const menu_ul = document.querySelector('header.page-header div.menu > ul');
        if(menu_ul) {
            if(menu_ul.classList.contains('show')) {
                menu_ul.classList.remove('show');
            }
            else {
                menu_ul.classList.add('show');
            }
        }

    });
}