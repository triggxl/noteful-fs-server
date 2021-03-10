#!/bin/bash

psql -U Triggxl -d noteful -f ./migrations/folders/002.undo.delete_noteful_folder.sql
psql -U Triggxl -d noteful -f ./migrations/folders/001.undo.create_noteful_folder.sql

psql -U Triggxl -d noteful -f ./migrations/notes/002.undo.delete_noteful_note.sql
psql -U Triggxl -d noteful -f ./migrations/notes/001.undo.create_noteful_note.sql

psql -U Triggxl -d noteful -f ./migrations/folders/001.do.create_noteful_folder.sql
psql -U Triggxl -d noteful -f ./migrations/folders/002.do.delete_noteful_folder.sql

psql -U Triggxl -d noteful -f ./migrations/notes/001.do.create_noteful_note.sql
psql -U Triggxl -d noteful -f ./migrations/notes/002.do.delete_noteful_note.sql

