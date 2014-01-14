var $ = require('jquery');

module.exports = Litebox;

var defaults = {
    liteboxID: 'litebox',
    classShow: 'is-shown',
    classHide: 'is-hidden',
    classShowChevrons: 'show-chevrons',

    useCaption: false,

    liteboxShadowID: 'litebox-shadow',
    liteboxCloseButtonID: 'litebox-modal-close',
    liteboxGalleryTag: 'data-lightbox',

    closeContent: '&nbsp;',

    cssTransitionHide: 500
};

function Litebox(element, options) {
    this.options = options || {};
    for (var i in defaults) {
        if (!(this.options[i])) this.options[i] = defaults[i];
    }
    this._element = element;
    this.id;
    this.item = [];
    this.html;

    this.onClickOpen();
    this.onCLickClose();

}

Litebox.prototype.close = function() {
    var component = this;

    $('#' + this.id).addClass(this.options.classHide);
    
    $('body').off('click.litebox.close', '#' + component.id + ' .' + component.options.liteboxShadowID);
    $('body').off('click.litebox.close', '#' + component.id + ' .' + component.options.liteboxCloseButtonID);
    $('body').off('click.litebox.chevrons', '#' + component.id + ' .gallery-controllers');
    $('body').off('keyup.litebox.close');

    setTimeout(function(){
        component._destory();
    }, component.options.cssTransitionHide);

    return this;
};

Litebox.prototype.onCLickClose = function() {
    var component = this;
    $('body').on('click.litebox.close', '.' + component.options.liteboxShadowID + ', .' + component.options.liteboxCloseButtonID , this, function(e){
        e.preventDefault();
        e.stopPropagation();
        component.close();
    });

    return this;
};

Litebox.prototype.onClickOpen = function() {
    var component = this;

    $('body').on('click.litebox.open', component._element, this, function(e){
        e.preventDefault();

        var galleryID = $(this).attr(component.options.liteboxGalleryTag) || '';
        
        if (galleryID) {
            
            var gallerySelector = $('[' + component.options.liteboxGalleryTag + '="' + galleryID + '"]');
            
            for (var i = 0; i < gallerySelector.length; i++) {
                component.item[i] = {};
                component.item[i].url = gallerySelector[i].getAttribute('href');
                component.item[i].title = gallerySelector[i].getAttribute('title') || '';
            }

        } else {
            
            component.item[0] = {};
            component.item[0].url = $(this).attr('href');
            component.item[0].title = $(this).attr('title') || '';
        }

        component._build();
        component._onKeyClose();
    });

    return this;
};

// build generated Litebox element to DOM
Litebox.prototype._build = function(html) {
    var component = this;
    this.id = this.options.liteboxID + '-' + this.setID();

    $('body').append(component._createHTML());

    if (component.item.length > 1) {
        component._chevronController(); 
        component._onKeyLeft();
        component._onKeyRight();
    }

    setTimeout(function(){
        $('#' + component.id).addClass(component.options.classShow);
    }, 50);

    setTimeout(function(){
        $('#' + component.id).addClass(component.options.classShowChevrons);
    }, 1000);

    setTimeout(function(){
        $('#' + component.id).removeClass(component.options.classShowChevrons);
    }, 2500);

    return this;
};

// remove Litebox element from DOM
Litebox.prototype._destory = function() {
    
    var litebox = document.getElementById(this.id);

    if (litebox) {
        litebox.parentNode.removeChild(litebox);
        this.id = '';       // clear lightbox ID
        this.item = [];     // clear item array
        this.html = '';     // clear generated html template
    }

    return this;
};

Litebox.prototype._createHTML = function() {
    var html;
    var component = this;

    html =  '<div class="litebox" id="' + this.id + '">';
    html +=     '<a href="#" class="litebox-shadow">&nbsp;</a>';
    html +=     '<div class="litebox-modal">';
    
    if (component.item.length > 1) {
        for (var i = 0; i < component.item.length; i++) {
            if (i === 0) {
                html += '<div class="litebox-item" id="litebox-item-' + i + '">';
            } else {
                html += '<div class="litebox-item is-off" id="litebox-item-' + i + '">';
            }
            html +=     '<div class="litebox-item-content">';
            html +=         '<img src="' + component.item[i].url + '" alt="' + component.item[i].title + '">';
            html +=         '<a href="#litebox-item-' + component._index(i, -1, (component.item.length - 1) ) + '" class="gallery-controllers chevron-left">&nbsp;</a>';
            html +=         '<a href="#litebox-item-' + component._index(i, 1, (component.item.length -1) ) + '" class="gallery-controllers chevron-right">&nbsp;</a>';
            html +=     '</div>';
            html +=     '<div class="litebox-item-counter"><ul>';

            for (var counter = 0; counter < component.item.length; counter++) {
                if (counter === i) {
                    html +=     '<li class="is-active">&nbsp;</li>';
                } else {
                    html +=     '<li>&nbsp;</li>';
                }
            }
            
            html +=     '</ul></div>';
            html +=     '<div class="litebox-item-caption">';
            html +=         '<div class="litebox-item-caption-content">' + component.item[i].title + '</div>';
            html +=     '</div>';
            html += '</div>';
        }
    } else {
        html +=     '<div class="litebox-item">';
        html +=         '<div class="litebox-item-content">';
        html +=             '<img src="' + component.item[0].url + '" alt="' + component.item[0].title + '">';
        html +=         '</div>';
        html +=         '<div class="litebox-item-caption">';
        html +=             '<div class="litebox-item-caption-content">' + component.item[0].title + '</div>';
        html +=         '</div>';
        html +=     '</div>';
    }
    
    html +=         '<a href="#" class="litebox-modal-close">' + component.options.closeContent + '</a>';
    html +=     '</div>';
    html += '</div>';

    this.html = html.toString();

    return this.html;
};

Litebox.prototype._chevronController = function() {
    
    var component = this;

    $('body').on('click.litebox.chevrons-left', '#' + component.id + ' .gallery-controllers.chevron-left', this, function(e){
        e.preventDefault();

        var targetID = $(this).attr('href');
        targetID = targetID.split('#')[1];
        targetID = '#' + targetID;

        $('#' + component.id + ' .litebox-item').each(function(){
            if (!$(this).hasClass('is-off')) {
                $(this).addClass('is-off');
            }
        });

        $('#' + component.id + ' .litebox-item' + targetID).removeClass('is-off');
    });

    $('body').on('click.litebox.chevrons-right', '#' + component.id + ' .gallery-controllers.chevron-right', this, function(e){
        e.preventDefault();

        var targetID = $(this).attr('href');
        targetID = targetID.split('#')[1];
        targetID = '#' + targetID;

        $('#' + component.id + ' .litebox-item').each(function(){
            if (!$(this).hasClass('is-off')) {
                $(this).addClass('is-off');
            }
        });

        $('#' + component.id + ' .litebox-item' + targetID).removeClass('is-off');
    });

    return this;
};

Litebox.prototype._onKeyClose = function() {
    var component = this;
    
    $('body').on('keyup.litebox.close', this, function(e){
        if (e.keyCode == 27) {
            component.close();
        }
    });

    return this;
};

Litebox.prototype._onKeyLeft = function() {
    var component = this;
    var componentID = component.id;
    
    $('body').on('keyup.litebox.left', function(e) {
        if (e.which === 37) {
            $('#' + componentID + ' [class="litebox-item"] .gallery-controllers.chevron-left').trigger('click.litebox.chevrons-left');
        }
    });
    return this;
};

Litebox.prototype._onKeyRight = function() {
    var component = this;
    var componentID = component.id;

    $('body').on('keyup.litebox.right', function(e) {
        if (e.which === 39) {
            $('#' + componentID + ' [class="litebox-item"] .gallery-controllers.chevron-right').trigger('click.litebox.chevrons-right');
        }
    });
    return this;
};

Litebox.prototype._index = function(num, move, max) {
    var index;

    index = num + move

    if (index === (max + 1)) {
        index = 0;
    } else if (index === -1) {
        index = max;
    }

    return index
};

Litebox.prototype.setID = function() {
    return Math.random().toString(36).slice(2);
};




