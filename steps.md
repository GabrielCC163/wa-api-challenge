heroku container:login
heroku create -a waprojectapi
heroku container:push web -a waprojectapi
heroku container:release web -a waprojectapi
heroku open