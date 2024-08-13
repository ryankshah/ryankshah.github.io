var themes = [
    'cerulean',
    'cosmo',
    'cyborg',
    'darkly',
    'flatly',
    'journal',
    'litera',
    'lumen',
    'lux',
    'materia',
    'minty',
    'pulse',
    'sandstone',
    'simplex',
    'sketchy',
    'slate',
    'solar',
    'spacelab',
    'superhero',
    'united',
    'yeti'
];

$(document).ready(function () {
    $('[data-class]').click(function () {
        updateNavbarClass($(this).attr('data-class'));
    });

    updateNavbarClass('fixed-left');

    themes.forEach(function (theme) {
        $('#theme_select').append($('<option>', {
            value: theme,
            text: theme.charAt(0).toUpperCase() + theme.slice(1),
            selected: theme === 'materia'
        }));
    });
});

function updateNavbarClass(className) {
    $('nav')
        .removeClass(function (index, css) {
            return (css.match(/(^|\s)fixed-\S+/g) || []).join(' ');
        })
        .addClass(className);

    $('[data-class]').removeClass('active').parent('li').removeClass('active');
    $('[data-class="' + className + '"]').addClass('active').parent('li').addClass('active');

    fixBodyMargin(className);
}

function fixBodyMargin(className) {
    if (/fixed-(left|right)/.test(className)) {
        $('body').removeAttr('style');
        if (className === 'fixed-right') {
            $('body').css('marginLeft', 0);
        } else {
            $('body').css('marginRight', 0);
        }
    } else {
        $('body').css({
            "margin-right": 0,
            "margin-left": 0,
            "padding-top": '90px'
        });
    }
}

function selectTheme(theme) {
    $('#theme_link').attr('href', 'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.3.1/' + theme + '/bootstrap.min.css');
}


document.addEventListener('DOMContentLoaded', function () {
    var dropdowns = document.querySelectorAll('.navbar-nav .nav-item.dropdown');

    dropdowns.forEach(function (dropdown) {
        var toggle = dropdown.querySelector('.dropdown-toggle');
        var menu = dropdown.querySelector('.dropdown-menu');
        var activeItem = dropdown.querySelector('.dropdown-item.active');

        // Keep dropdown open if an item has an active class
        if (activeItem) {
            dropdown.classList.add('show');
            menu.classList.add('show');
        }

        // Toggle the dropdown on click
        toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation(); // Prevent the click from closing the dropdown

            // Toggle the show class
            var isOpen = dropdown.classList.contains('show');
            dropdowns.forEach(function (d) { // Close other open dropdowns
                d.classList.remove('show');
                d.querySelector('.dropdown-menu').classList.remove('show');
            });

            if (!isOpen) {
                dropdown.classList.add('show');
                menu.classList.add('show');
            }
        });

        // Prevent dropdown from closing when clicking inside the dropdown menu
        menu.addEventListener('click', function (event) {
            event.stopPropagation();
        });
    });

    // Allow clicking outside the navbar to close any open dropdown
    document.addEventListener('click', function () {
        dropdowns.forEach(function (dropdown) {
            dropdown.classList.remove('show');
            dropdown.querySelector('.dropdown-menu').classList.remove('show');
        });
    });
});

