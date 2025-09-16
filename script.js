// Function to generate a unique pastel color for each card
function getColorForCard(id) {
  const hue = (id * 137.508) % 360; // Uses the "golden angle" to generate distinct colors
  return `hsl(${hue}, 60%, 85%)`;
}

/**
 * Function to generate the XML content for Draw.io, without zig-zag row or column placement.
 * 
 * @param {number} totalWidth - Total number of panels in width
 * @param {number} totalHeight - Total number of panels in height
 * @param {string} layout - Card layout (e.g., "2x3" or "3x2")
 * @returns {string} - XML content for Draw.io
 */
function generateDrawioXml(totalWidth, totalHeight, layout) {
  let cardRows, cardCols;

  // Set the card layout configuration
  if (layout === "2x3") {
    cardRows = 2;
    cardCols = 3;
  } else {
    cardRows = 3;
    cardCols = 2;
  }

  const cardsWide = Math.ceil(totalWidth / cardCols);
  const cardsHigh = Math.ceil(totalHeight / cardRows);

  let idCounter = 2;
  const spacingX = 85;  // Horizontal distance between panels within a card
  const spacingY = 45;  // Vertical distance between panels within a card
  const cardSpacingX = cardCols * spacingX + 5; // Horizontal distance between cards
  const cardSpacingY = cardRows * spacingY + 5; // Vertical distance between cards

  const width = 80;   // Width of each panel
  const height = 40;  // Height of each panel

  let blocks = "";  // Store all XML cells here

  // Function to generate a card at position (cardX, cardY)
  function processCard(cardX, cardY) {
    const cardId = cardY * cardsWide + cardX + 1;  // Unique card ID
    const color = getColorForCard(cardId);         // Unique pastel color

    const offsetX = 100 + cardX * cardSpacingX;
    const offsetY = 100 + cardY * cardSpacingY;

    for (let row = 0; row < cardRows; row++) {
      for (let col = 0; col < cardCols; col++) {
        let panelLabel;

        // Calculate panel label based on layout
        if (layout === "2x3") {
          panelLabel = `${cardId}.${(row === 0 ? 2 * col + 1 : 2 * col + 2)}`;
        } else {
          panelLabel = `${cardId}.${row + 1 + col * cardRows}`;
        }

        const globalCol = cardX * cardCols + col;
        const globalRow = cardY * cardRows + row;

        if (globalCol < totalWidth && globalRow < totalHeight) {
          blocks += `
            <mxCell id="${idCounter}" value="${panelLabel}" style="shape=rectangle;fillColor=${color};fontSize=16;fontStyle=1;fontColor=#000000;" vertex="1" parent="1">
              <mxGeometry x="${offsetX + col * spacingX}" y="${offsetY + row * spacingY}" width="${width}" height="${height}" as="geometry"/>
            </mxCell>`;
          idCounter++;
        }
      }
    }
  }

  // Place the cards from top to bottom and left to right
  for (let cardX = 0; cardX < cardsWide; cardX++) {
    for (let cardY = 0; cardY < cardsHigh; cardY++) {
      processCard(cardX, cardY);
    }
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Panels" id="diagram-1">
    <mxGraphModel>
      <root>
        <mxCell id="0"/>
        <mxCell id="1" parent="0"/>
        ${blocks}
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

/**
 * Function triggered when the button is clicked,
 * collects the values from the inputs, validates them, and generates the XML file for download.
 */
function generateAndDownload() {
  const totalWidth = parseInt(document.getElementById("totalWidth").value);
  const totalHeight = parseInt(document.getElementById("totalHeight").value);
  const layout = document.querySelector('input[name="cardLayout"]:checked').value; // Get selected layout

  // Calculate the total number of cards
  const totalModules = totalWidth * totalHeight;

  if (totalWidth <= 0 || totalHeight <= 0) {
    alert("Values for width and height must be greater than 0");
    return;
  }

  const xml = generateDrawioXml(totalWidth, totalHeight, layout);

  // Create a Blob for the XML file
  const blob = new Blob([xml], { type: "text/xml" });

  // Create a download link with a name containing the total number of cards
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${totalModules} carduri.drawio`; // Filename will be schema6_carduri.drawio, schema12_carduri.drawio, etc.
  link.click();
}
