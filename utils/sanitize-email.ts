import sanitizeHtml from "sanitize-html";

export const sanitizeEmailContent = (htmlContent: string): string => {
  if (!htmlContent) return "";

  try {
    // First, remove any data attributes from body tags
    let sanitized = htmlContent.replace(
      /<body([^>]*)>/g,
      (match, attributes) => {
        // Strip out any data-* attributes including data-gr-* and data-new-gr-*
        const cleanedAttributes = attributes.replace(
          /\s+data-[\w\-]+="[^"]*"/g,
          ""
        );
        return `<body${cleanedAttributes}>`;
      }
    );

    // Next, handle inline attributes anywhere in the document
    sanitized = sanitized.replace(
      /\s+data-(new-gr-c-s-check-loaded|gr-ext-installed|cke-saved-src|mce-src)="[^"]*"/g,
      ""
    );

    // Remove other known problematic attributes
    sanitized = sanitized.replace(/\s+data-gramm="[^"]*"/g, "");
    sanitized = sanitized.replace(/\s+data-gramm_editor="[^"]*"/g, "");
    sanitized = sanitized.replace(/\s+data-enable-grammarly="[^"]*"/g, "");

    // Remove Microsoft Office namespace attributes
    sanitized = sanitized.replace(/\s+xmlns:o="[^"]*"/g, "");
    sanitized = sanitized.replace(/\s+xmlns:w="[^"]*"/g, "");
    sanitized = sanitized.replace(/\s+xmlns:m="[^"]*"/g, "");
    sanitized = sanitized.replace(/\s+xmlns:v="[^"]*"/g, "");

    // Fix tables with fixed widths to make them responsive
    sanitized = sanitized.replace(
      /<table([^>]*)width="([^"]*)"([^>]*)>/g,
      '<table$1style="width: 100%; max-width: $2;"$3>'
    );

    // Add max-width to images to prevent them from overflowing
    sanitized = sanitized.replace(/<img([^>]*)>/g, (match, attributes) => {
      // Check if the image already has a style attribute
      if (attributes.includes('style="')) {
        // Add max-width to existing style
        return match.replace(
          /style="([^"]*)"/g,
          'style="$1; max-width: 100%; height: auto;"'
        );
      } else {
        // Add style attribute if it doesn't exist
        return `<img${attributes} style="max-width: 100%; height: auto;">`;
      }
    });

    // Add responsive wrapper around the content
    sanitized = `
      <div class="email-content-wrapper" style="width: 100%; overflow-x: auto;">
        ${sanitized}
      </div>
    `;

    // Add responsive meta tag if the content includes a <head> tag
    if (sanitized.includes("<head>")) {
      sanitized = sanitized.replace(
        "<head>",
        '<head><meta name="viewport" content="width=device-width, initial-scale=1.0">'
      );
    }

    // Then run through sanitize-html to remove potentially dangerous HTML
    sanitized = sanitizeHtml(sanitized, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "style",
        "font",
        "div",
        "span",
        "br",
        "p",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody",
        "a",
        "ul",
        "ol",
        "li",
        "b",
        "strong",
        "i",
        "em",
        "hr",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "caption",
        "col",
        "colgroup",
        "meta",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        "*": ["style", "class", "id", "align", "dir", "lang"],
        img: [
          "src",
          "alt",
          "width",
          "height",
          "style",
          "class",
          "id",
          "loading",
        ],
        a: ["href", "target", "rel", "style", "class", "id"],
        table: [
          "width",
          "border",
          "cellpadding",
          "cellspacing",
          "style",
          "class",
          "id",
        ],
        td: [
          "width",
          "valign",
          "align",
          "style",
          "class",
          "colspan",
          "rowspan",
        ],
        th: [
          "width",
          "valign",
          "align",
          "style",
          "class",
          "colspan",
          "rowspan",
        ],
        meta: ["name", "content"],
      },
      allowedStyles: {
        "*": {
          color: [/.*/],
          "font-size": [/.*/],
          "font-family": [/.*/],
          "background-color": [/.*/],
          "text-align": [/.*/],
          width: [/.*/],
          height: [/.*/],
          "max-width": [/.*/],
          "min-width": [/.*/],
          "max-height": [/.*/],
          "min-height": [/.*/],
          margin: [/.*/],
          "margin-top": [/.*/],
          "margin-bottom": [/.*/],
          "margin-left": [/.*/],
          "margin-right": [/.*/],
          padding: [/.*/],
          "padding-top": [/.*/],
          "padding-bottom": [/.*/],
          "padding-left": [/.*/],
          "padding-right": [/.*/],
          border: [/.*/],
          "border-top": [/.*/],
          "border-bottom": [/.*/],
          "border-left": [/.*/],
          "border-right": [/.*/],
          display: [/.*/],
          "text-decoration": [/.*/],
          "vertical-align": [/.*/],
          overflow: [/.*/],
          "overflow-x": [/.*/],
          "overflow-y": [/.*/],
        },
      },
      // Add CSS to make email more responsive
      transformTags: {
        table: (tagName, attribs) => {
          // Add responsive styles to tables
          let style = attribs.style || "";
          if (!style.includes("max-width")) {
            style += "; max-width: 100%; table-layout: auto;";
          }
          return {
            tagName,
            attribs: {
              ...attribs,
              style,
            },
          };
        },
      },
    });

    // Add additional responsive CSS for mobile screens
    const responsiveStyles = `
      <style>
        * { box-sizing: border-box; }
        body, html { width: 100%; }
        img { max-width: 100% !important; height: auto !important; }
        table { width: 100% !important; max-width: 100% !important; }
        
        @media (max-width: 600px) {
          table, tr, td, th { 
            width: 100% !important;
            display: block !important;
          }
        }
        
        /* Make content fit container when resizing */
        .email-content-wrapper {
          width: 100% !important;
          max-width: 100% !important;
          overflow-x: hidden !important;
        }
      </style>
    `;

    // Add the styles to the beginning of the content
    sanitized = responsiveStyles + sanitized;

    return sanitized;
  } catch (error) {
    console.error("Error sanitizing email content:", error);
    // Return a plain text version as fallback
    return htmlContent.replace(/<[^>]*>/g, " ");
  }
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (reader.result) {
        // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
        const base64String = reader.result.toString().split(",")[1];
        resolve(base64String);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};
