# Manual testing

## Approve pins - basic

Approving pins, the functionality should:

1. Delete pin from unapproved_pins database, and image from cloudinary - P
2. Put new data in new database with and upload cloudinary file. - P
3. Clicking on approve multiple times should not trigger multiple API calls - P

## Setting pins - basic

1. Shows an error when inserting a marker while not logged in - P
2. When enter you enter "ASDF" and pin name and marker, sends it to the backend displayable on backend and on the admin dashboard in unapproved pins. - P
3. Shows an error when inserting a marker while logged in, but no position on the map - P
4. Cannot click more than 10 times in a row when submit - P
5. Uploading without a file results in an error or prompt. - P

# Setting pins - edge cases

1. When trying to put a pin in a NON-boundaried zone, produce an error
2. Enter a pin name that is 200+ lines long
3. Enter a pin name with weird special characters - '@HASJKD)(J DA/)~~'
