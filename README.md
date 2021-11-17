## Steps

1. Download the data you want from Splunk as a CSV file.
1. Import it to a spreadsheet.
1. Sort alphabetically the `requestUrl` column.
1. Copy them into a file called `url.txt` inside the `/data/<cluster>` folder.
1. Replace the internal host name with the public one in each URL (use the *Replace All* fucntionality).
1. Provide `USER AGENT` in the `.env` file.
1. Uncomment the function call `orderAndFetch()` at the `index.ts` file using the cluster you want as a parameter.
1. Run `yarn dev`