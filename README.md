# BowlGamesPublic

# Point of Program

This Program is designed to gather data from a Google Form using the Google Sheets API.
To then compare it to the data from the College Football API to see how many correct predictions
that the set of users in the Google From made. The program will then output the total points for each user 
and add the points for each user to a database. This Database will then be used on the front in to display the
total points for each user in a leaderboard format.

# Missing Code And How To Fix

Becuase of security reason the credentials.json is empty but it should be filled with the Json file that is give 
to you bye google when you set up your service account. the index.html is also missing infomation CLIENT_ID and API_KEY this is gathered by following the steps in this quick start guide https://developers.google.com/sheets/api/quickstart/js

# Errors

The first time the program runs it will throw a error because it is creating the answers.json and results.json for the first time 
while also trying to use them. This Error will resolve it self if you run the program again and change nothing.

# Contact Info

If you have questions regarding code or errors you encounter contact me at mastingarrett20@gmail.com


