document.addEventListener("DOMContentLoaded", function () {
  const centeredContainer = document.querySelector(".centered-container");
  const rows = document.querySelectorAll(".row");
  const centeredText = document.querySelector(".centered");
  const fogOverlay = document.querySelector(".fog-overlay");

  if (!centeredContainer || !rows.length || !centeredText || !fogOverlay) {
    console.error(
      "Centered container, centered text, rows, or fog overlay not found"
    );
    return;
  }

  const viewportHeight = window.innerHeight;
  const bufferPeriod = 0.25 * viewportHeight; // Define a 25vh buffer period

  const rowConfigurations = {
    one: {
      startPositions: [-200, -120, -80, 0, 50, 180, 0],
      translateYDirection: -20,
    },
    two: {
      startPositions: [0, -150, -60, -10, 0, 50, 100],
      translateYDirection: -20,
    },
    "mobile-only-row": {
      startPositions: [0, 0],
      translateYDirection: 0,
    },
    three: {
      startPositions: [0, -50, 0, -10, 80, 100, 0],
      translateYDirection: 20,
    },
    four: {
      startPositions: [-100, -25, 0, -15, 80, 150],
      translateYDirection: 20,
    },
  };

  const updateRowPosition = (
    row,
    scrollPosition,
    translateDistance,
    centeredContainerTop,
    centeredContainerMiddle,
    stationaryEnd,
    translateOutStart,
    startPositions,
    translateYDirection
  ) => {
    const translateInStart = centeredContainerTop;
    let rowPosition = (scrollPosition - translateInStart) / translateDistance;
    let translateYValue;

    if (rowPosition > 1) rowPosition = 1;

    if (translateYDirection !== 0) {
      if (
        scrollPosition >= translateInStart &&
        scrollPosition <= centeredContainerMiddle
      ) {
        // Translation in
        translateYValue = (1 - rowPosition) * translateYDirection; // Start at the top or bottom of the screen
        row.style.transform = `translate(0%, ${translateYValue}vh)`;
        row.style.opacity = rowPosition;
      } else if (
        scrollPosition > centeredContainerMiddle &&
        scrollPosition <= stationaryEnd
      ) {
        // Stationary period
        row.style.transform = `translate(0%, 0vh)`;
        row.style.opacity = 1;
      } else if (
        scrollPosition > stationaryEnd &&
        scrollPosition <= translateOutStart
      ) {
        // Translation out
        rowPosition = (scrollPosition - stationaryEnd) / translateDistance;
        translateYValue = rowPosition * translateYDirection;
        row.style.transform = `translate(0%, ${translateYValue}vh)`;
        row.style.opacity = 1 - rowPosition;
      } else if (scrollPosition < translateInStart) {
        row.style.transform = `translate(0%, ${translateYDirection}vh)`; // Initial off-screen position
        row.style.opacity = 0;
      } else {
        row.style.transform = `translate(0%, ${translateYDirection}vh)`; // Initial off-screen position
        row.style.opacity = 0;
      }
    }

    const elements = row.querySelectorAll(".hexagon, .img-containing-div");
    elements.forEach((element, index) => {
      let elementPosition =
        (scrollPosition - translateInStart) / translateDistance;
      let translateXValue;

      translateXValue = (1 - elementPosition) * startPositions[index];
      if (startPositions[index] < 0) {
        translateXValue = Math.min(0, translateXValue); // Clamp translateXValue to a maximum of 0
      } else {
        translateXValue = Math.max(0, translateXValue); // Clamp translateXValue to a minimum of 0
      }

      if (elementPosition > 1) elementPosition = 1;

      if (
        scrollPosition >= translateInStart &&
        scrollPosition <= centeredContainerMiddle
      ) {
        // Translation in
        element.style.transform = `translate(${translateXValue}%, 0)`;
        element.style.opacity = elementPosition;
      } else if (
        scrollPosition > centeredContainerMiddle &&
        scrollPosition <= stationaryEnd
      ) {
        // Stationary period
        element.style.transform = `translate(0%, 0)`;
        element.style.opacity = 1;
      } else if (
        scrollPosition > stationaryEnd &&
        scrollPosition <= translateOutStart
      ) {
        // Translation out
        elementPosition = (scrollPosition - stationaryEnd) / translateDistance;
        translateXValue = elementPosition * startPositions[index];
        element.style.transform = `translate(${translateXValue}%, 0)`;
        element.style.opacity = 1 - elementPosition;
      } else if (scrollPosition < translateInStart) {
        element.style.transform = `translate(${startPositions[index]}%, 0)`;
        element.style.opacity = 0;
      } else {
        element.style.transform = `translate(${startPositions[index]}%, 0)`;
        element.style.opacity = 0;
      }
    });
  };

  const updateRowPositions = () => {
    const scrollPosition = window.scrollY;
    const centeredContainerRect = centeredContainer.getBoundingClientRect();
    const centeredContainerTop = centeredContainerRect.top + window.scrollY;
    const centeredContainerMiddle =
      centeredContainerTop + centeredContainerRect.height / 2;

    const rowFour = document.querySelector(".row.four");
    const rowFourBottom =
      rowFour.getBoundingClientRect().bottom + window.scrollY;
    const translateOutStart = rowFourBottom - viewportHeight + bufferPeriod; // Add buffer period to translateOutStart
    const translateDistance =
      (centeredContainerMiddle - centeredContainerTop) / 2; // Halve the translate distance
    const stationaryEnd = centeredContainerMiddle + bufferPeriod; // Define the end of the stationary period

    rows.forEach((row) => {
      const rowClass = row.classList[1]; // Assuming the row class is always the second class
      const config = rowConfigurations[rowClass];

      if (config) {
        updateRowPosition(
          row,
          scrollPosition,
          translateDistance,
          centeredContainerTop,
          centeredContainerMiddle,
          stationaryEnd,
          translateOutStart,
          config.startPositions,
          config.translateYDirection
        );
      }
    });

    // Ensure centered text remains sticky long enough
    if (scrollPosition <= translateOutStart) {
      centeredText.style.position = "sticky";
      centeredText.style.top = "50%";
      centeredText.style.transform = "translateY(-50%)";
    } else {
      centeredText.style.position = "static";
      centeredText.style.transform = "none";
    }

    // Update fog overlay opacity
    if (
      scrollPosition < centeredContainerTop ||
      scrollPosition > translateOutStart
    ) {
      fogOverlay.style.opacity = 0;
    } else if (
      scrollPosition >= centeredContainerTop &&
      scrollPosition <= stationaryEnd
    ) {
      fogOverlay.style.opacity = 1;
    } else {
      const fadeOutPosition =
        (scrollPosition - stationaryEnd) / translateDistance;
      fogOverlay.style.opacity = 1 - fadeOutPosition;
    }
  };

  window.addEventListener("scroll", updateRowPositions);
  updateRowPositions(); // Initial call
});
