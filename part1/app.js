/api/walkrequests/open

Return all open walk requests, including the dog name, requested time, location, and owner's username.

Sample Response:

[
  {
    "request_id": 1,
    "dog_name": "Max",
    "requested_time": "2025-06-10T08:00:00.000Z",
    "duration_minutes": 30,
    "location": "Parklands",
    "owner_username": "alice123"
  }
]
/api/walkers/summary

Return a summary of each walker with their average rating and number of completed walks.

Sample Response:

[
  {
    "walker_username": "bobwalker",
    "total_ratings": 2,
    "average_rating": 4.5,
    "completed_walks": 2
  },
  {
    "walker_username": "newwalker",
    "total_ratings": 0,
    "average_rating": null,
    "completed_walks": 0
  }
]