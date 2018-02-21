import html2canvas from 'html2canvas';
import interact from 'interactjs';
import tippy from 'tippy.js';

const convertImage = () => {
  html2canvas($(".image-container").get(0)).then((canvas) => $(".download-link").attr("href", canvas.toDataURL("image/png")));
};

const getCenter = () => {
  const center = $(".banner-center-center");
  const offset = center.offset();
  const width = center.width();
  const height = center.height();
  return { x: offset.left + width/2, y: offset.top + height/2 };
}

const setBannerTextStyle = () => {
  const container = $(".banner-container");
  const banner = $(".banner-text");
  const text = banner.text();
  const maxW = container.width() * 0.9;
  const maxH = container.height() * 0.9;
  const { x, y } = getCenter();

  const div = $("<div></div>").css("font-size", "1em").addClass("text-font").text(text);
  $(document.body).append(div);
  const w = div.width();
  const h = div.height();
  div.remove();

  banner.css({
    top: y,
    left: x,
    fontSize: `${Math.min(maxW/w, maxH/h)}em`,
  });
}

const addSticker = (url) => {
  const container = $(".image-container");
  const image = $("<img/>").attr({ src: url, tabIndex: 1 }).css({ height: 100, "z-index": 10, position: "absolute" });
  container.prepend(image);
  setDraggable(image.get(0));
  setResizable(image.get(0), { preserveAspectRatio: true, useTranslate: true });
  image.mouseover(function(e) { $(this).focus(); });
  image.bind("touchstart", function(e) { $(this).focus(); });
  image.keyup(function(e) {
    console.log(e.keyCode)
    if (e.keyCode === 27 || e.keyCode === 8 || e.keyCode === 46) {
      $(this).remove();
    }
  });
}

const setDraggable = (element, options = {}) => interact(element).draggable($.extend(true, {}, {
  restrict: {
    restriction: "parent",
    endOnly: false,
  },
  onmove: (e) => {
    const ele = $(e.target);
    const x = parseFloat(ele.attr("data-x") || 0) + e.dx;
    const y = parseFloat(ele.attr("data-y") || 0) + e.dy;
    ele.css({
      transform: `translate(${x}px, ${y}px)`
    }).attr({
      "data-x": x,
      "data-y": y,
    })
  },
  onend: () => convertImage(),
}, options));

const setResizable = (element, options = {}) => interact(element).resizable($.extend(true, {}, {
  edges: {
    left: true,
    right: true,
    bottom: true,
    top: true,
  },
  restrictEdges: {
    outer: "parent",
    endOnly: false,
  },
  restrictSize: {
    min: { width: 50, height: 50 },
  },
}, options)).on("resizemove", (e) => {
  const ele = $(e.target);
  const x = parseFloat(ele.attr("data-x") || 0) + e.deltaRect.left;
  const y = parseFloat(ele.attr("data-y") || 0) + e.deltaRect.top;

  if (options.useTranslate) {
    ele.css({
      width: `${e.rect.width}px`,
      height: `${e.rect.height}px`,
      transform: `translate(${x}px, ${y}px)`,
    }).attr({
      "data-x": x,
      "data-y": y,
    });
  } else {
    // TODO: still need to optimize this
    const minWidth = (options.restrictSize && options.restrictSize.min && options.restrictSize.min.width) || 0;
    const minHeight = (options.restrictSize && options.restrictSize.min && options.restrictSize.min.height) || 0;
    ele.css({
      width: `${Math.max(e.rect.width + (e.edges.right?x:-x), minWidth)}px`,
      height: `${Math.max(e.rect.height + (e.edges.bottom?y:-y), minHeight)}px`,
    }).attr({
      "data-x": x,
      "data-y": y,
    });
  }

  setBannerTextStyle();
}).on("resizeend", (e) => {
  convertImage();
});

$(function() {
  setResizable(".banner-container", {
    restrictEdges: {
      endOnly: true,
    },
    restrictSize: {
      min: { width: 320, height: 320 },
    },
  });

  $(".text-picker input").keyup((e) => {
    const currentText = $(".banner-text").text();
    const text = e.target.value;
    if (currentText !== text) {
      $(".banner-text").text(text || "");
      setBannerTextStyle();
      convertImage();
    }
  });

  $(window).resize((e) => {
    setBannerTextStyle();
    convertImage();
  });

  $(".sticker-picker select").val("0").imagepicker({
    initialized: () => tippy(".sticker-picker .image_picker_selector img", {
      placement: "bottom",
      arrow: true,
      size: "small",
      distance: 60,
      html: "#sticker-tooltip",
    }),
    clicked: (select, e) => addSticker($(e.target).attr("src")),
  });

  tippy(".text-picker input", {
    placement: "top",
    arrow: true,
    size: "small",
    distance: 10,
    html: "#text-tooltip",
  });

  tippy(".banner-container", {
    placement: "left",
    arrow: true,
    size: "small",
    distance: 10,
    html: "#banner-tooltip",
  });

  tippy(".credit img", {
    placement: "top",
    arrow: true,
    size: "small",
    distance: 10,
    html: "#credit-tooltip",
  });

  tippy(".download-link", {
    placement: "top",
    arrow: true,
    size: "small",
    distance: 20,
    html: "#download-tooltip",
  });

  setBannerTextStyle();
  convertImage();
});
