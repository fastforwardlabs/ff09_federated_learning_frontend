2018-08-29

- Discussed initial API possibilities with Mike.
- Decided to start with a dump of the engine data with a column containing the prediction. I will use that to start exploring how to visualize the sensor data over time.
- Mike sent me the data dump.
- Current idea for the API: one endpoint that gets me back all sensor data for an engine over time, prediction over time is a column within that engine data (won't need to make any additional calls).

2018-09-05

- Set up frontend repo.
- Set up data container loader for the React app (to avoid constant refresh while developing).
- Set up preprocessing of data to get it in shape for display.
- Made a proof-of-concept rendering all the engines in rows, then stepping through the time for each.

2018-09-06

- Determine max,min ranges for each feature.
- Experiment with color scales, sequential then diverging.
- Experiment with numberless visualizations.

2018-09-07 - 2018-09-14

- Refactored structure several times to be able to run simulation with good performance, using multiple criteria

2018-09-17

-
